import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SendMessageDto } from "./dto/send-message.dto";

function encodeMessageCursor(message: { createdAt: Date; id: string }): string {
  return Buffer.from(JSON.stringify({ createdAt: message.createdAt.toISOString(), id: message.id })).toString("base64url");
}

function decodeMessageCursor(cursor: string): { createdAt: Date; id: string } {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as { createdAt: string; id: string };
    if (!parsed.createdAt || !parsed.id) throw new Error("Invalid cursor payload");
    const createdAt = new Date(parsed.createdAt);
    if (Number.isNaN(createdAt.getTime())) throw new Error("Invalid cursor date");
    return { createdAt, id: parsed.id };
  } catch {
    throw new BadRequestException("Invalid cursor");
  }
}

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    conversationId: string,
    dto: SendMessageDto,
    senderType: "VISITOR" | "AGENT" | "SYSTEM",
    senderId?: string,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, deletedAt: null },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (conversation.status === "CLOSED" && senderType === "VISITOR") {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { status: "ACTIVE" },
      });
    }

    if (dto.messageType === "INTERNAL_NOTE" && senderType !== "AGENT") {
      throw new ForbiddenException("Only agents can send internal notes");
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderType,
        senderId: senderId ?? null,
        messageType: dto.messageType ?? "TEXT",
        content: dto.content,
        replyToId: dto.replyToId ?? null,
      },
      include: {
        replyTo: {
          select: {
            id: true,
            content: true,
            senderType: true,
            senderId: true,
          },
        },
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      message: "Message sent successfully",
      data: message,
    };
  }

  async findByConversation(
    conversationId: string,
    filters?: {
      limit?: number;
      cursor?: string;
      direction?: "next" | "prev";
      excludeInternalNotes?: boolean;
    },
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, deletedAt: null },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
    const direction = filters?.direction ?? "next";
    const cursor = filters?.cursor;

    const baseWhere: Record<string, unknown> = { conversationId, deletedAt: null };
    if (filters?.excludeInternalNotes) {
      baseWhere.messageType = { not: "INTERNAL_NOTE" };
    }

    let where: Record<string, unknown> = baseWhere;
    if (cursor) {
      const { createdAt: cursorDate, id: cursorId } = decodeMessageCursor(cursor);
      const cursorWhere =
        direction === "prev"
          ? { OR: [{ createdAt: { gt: cursorDate } }, { createdAt: cursorDate, id: { gt: cursorId } }] }
          : { OR: [{ createdAt: { lt: cursorDate } }, { createdAt: cursorDate, id: { lt: cursorId } }] };
      where = { AND: [baseWhere, cursorWhere] };
    }

    const messagesPlusOne = await this.prisma.message.findMany({
      where: where as never,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: {
        replyTo: {
          select: { id: true, content: true, senderType: true, senderId: true },
        },
      },
    });

    const hasExtra = messagesPlusOne.length > limit;
    const messagesDesc = hasExtra ? messagesPlusOne.slice(0, limit) : messagesPlusOne;
    // Return in asc order for display (oldest first) but pagination is based on desc order
    const messages = [...messagesDesc].reverse();

    return {
      message: "Messages fetched successfully",
      data: {
        messages,
        pagination: {
          limit,
          direction,
          cursor: cursor ?? null,
          nextCursor:
            direction === "next"
              ? hasExtra
                ? encodeMessageCursor(messagesDesc[messagesDesc.length - 1] as never)
                : null
              : messagesDesc.length
                ? encodeMessageCursor(messagesDesc[messagesDesc.length - 1] as never)
                : null,
          prevCursor:
            direction === "prev"
              ? hasExtra
                ? encodeMessageCursor(messagesDesc[0] as never)
                : null
              : cursor && messagesDesc.length
                ? encodeMessageCursor(messagesDesc[0] as never)
                : null,
          hasNext: direction === "next" ? hasExtra : messagesDesc.length > 0,
          hasPrev: direction === "prev" ? hasExtra : !!cursor,
        },
      },
    };
  }

  private async findOwnMessageOrThrow(
    conversationId: string,
    messageId: string,
    userId: string,
  ) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, conversationId, deletedAt: null },
    });
    if (!message) {
      throw new NotFoundException("Message not found");
    }
    if (message.senderType !== "AGENT" || message.senderId !== userId) {
      throw new ForbiddenException("You can only edit or delete your own messages");
    }
    return message;
  }

  async edit(conversationId: string, messageId: string, userId: string, content: string) {
    await this.findOwnMessageOrThrow(conversationId, messageId, userId);

    const message = await this.prisma.message.update({
      where: { id: messageId },
      data: { content, isEdited: true, editedAt: new Date() },
      include: {
        replyTo: {
          select: { id: true, content: true, senderType: true, senderId: true },
        },
      },
    });

    return {
      message: "Message edited successfully",
      data: message,
    };
  }

  async softDelete(conversationId: string, messageId: string, userId: string) {
    await this.findOwnMessageOrThrow(conversationId, messageId, userId);

    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    return { message: "Message deleted successfully" };
  }

  async markAsRead(conversationId: string, senderType: "VISITOR" | "AGENT") {
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderType: senderType === "AGENT" ? "VISITOR" : "AGENT",
        status: { not: "READ" },
      },
      data: { status: "READ" },
    });

    return { message: "Messages marked as read" };
  }
}
