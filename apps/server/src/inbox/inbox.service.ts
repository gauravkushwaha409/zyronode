import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function encodeCursor(conversation: { updatedAt: Date; id: string }): string {
  return Buffer.from(JSON.stringify({ updatedAt: conversation.updatedAt.toISOString(), id: conversation.id })).toString("base64url");
}

function decodeCursor(cursor: string): { updatedAt: Date; id: string } {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as { updatedAt: string; id: string };
    if (!parsed.updatedAt || !parsed.id) throw new Error("Invalid cursor payload");
    const updatedAt = new Date(parsed.updatedAt);
    if (Number.isNaN(updatedAt.getTime())) throw new Error("Invalid cursor date");
    return { updatedAt, id: parsed.id };
  } catch {
    throw new BadRequestException("Invalid cursor");
  }
}

@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  async getConversations(
    organizationId: string,
    filters?: {
      status?: string;
      search?: string;
      limit?: number;
      cursor?: string;
      direction?: "next" | "prev";
    },
  ) {
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
    const direction = filters?.direction ?? "next";
    const cursor = filters?.cursor;

    const baseWhere: Record<string, unknown> = { organizationId };
    if (filters?.status) baseWhere.status = filters.status;
    if (filters?.search) {
      baseWhere.OR = [
        { visitorName: { contains: filters.search, mode: "insensitive" } },
        { visitorEmail: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    let where: Record<string, unknown> = baseWhere;
    if (cursor) {
      const { updatedAt: cursorDate, id: cursorId } = decodeCursor(cursor);
      const cursorWhere =
        direction === "prev"
          ? { OR: [{ updatedAt: { gt: cursorDate } }, { updatedAt: cursorDate, id: { gt: cursorId } }] }
          : { OR: [{ updatedAt: { lt: cursorDate } }, { updatedAt: cursorDate, id: { lt: cursorId } }] };
      where = { AND: [baseWhere, cursorWhere] };
    }

    const conversationsPlusOne = await this.prisma.conversation.findMany({
      where: where as never,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, content: true, senderType: true, messageType: true, createdAt: true },
        },
        _count: { select: { messages: { where: { senderType: "VISITOR", status: { not: "READ" } } } } },
      },
    });

    const hasExtra = conversationsPlusOne.length > limit;
    const conversations = hasExtra ? conversationsPlusOne.slice(0, limit) : conversationsPlusOne;

    const data = conversations.map((conversation) => {
      const lastMessage = conversation.messages[0] ?? null;
      return {
        id: conversation.id,
        status: conversation.status,
        channel: conversation.channel,
        visitorName: conversation.visitorName,
        visitorEmail: conversation.visitorEmail,
        lastMessageAt: conversation.updatedAt,
        createdAt: conversation.createdAt,
        lastMessage: lastMessage
          ? { content: lastMessage.content, senderType: lastMessage.senderType, messageType: lastMessage.messageType, createdAt: lastMessage.createdAt }
          : null,
        unreadCount: conversation._count.messages,
      };
    });

    return {
      message: "Inbox conversations fetched successfully",
      data: {
        conversations: data,
        pagination: {
          limit,
          direction,
          cursor: cursor ?? null,
          nextCursor:
            direction === "next"
              ? hasExtra
                ? encodeCursor(conversations[conversations.length - 1] as never)
                : null
              : conversations.length
                ? encodeCursor(conversations[conversations.length - 1] as never)
                : null,
          prevCursor:
              direction === "prev"
                ? hasExtra
                  ? encodeCursor(conversations[0] as never)
                  : null
                : cursor && conversations.length
                  ? encodeCursor(conversations[0] as never)
                  : null,
          hasNext: direction === "next" ? hasExtra : conversations.length > 0,
          hasPrev: direction === "prev" ? hasExtra : !!cursor,
        },
      },
    };
  }

  async getConversationDetails(organizationId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
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
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    return {
      message: "Conversation details fetched successfully",
      data: conversation,
    };
  }

  async closeConversation(organizationId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: "CLOSED" },
    });

    return {
      message: "Conversation closed successfully",
      data: updated,
    };
  }

  async reopenConversation(organizationId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: "ACTIVE" },
    });

    return {
      message: "Conversation reopened successfully",
      data: updated,
    };
  }
}
