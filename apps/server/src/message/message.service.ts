import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SendMessageDto } from "./dto/send-message.dto";

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    conversationId: string,
    dto: SendMessageDto,
    senderType: "VISITOR" | "AGENT" | "SYSTEM",
    senderId?: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
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

  async findByConversation(conversationId: string, page = 1, limit = 50) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      message: "Messages fetched successfully",
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
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
