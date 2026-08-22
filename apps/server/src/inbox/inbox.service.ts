import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  async getConversations(
    organizationId: string,
    filters?: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { organizationId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { visitorName: { contains: filters.search, mode: "insensitive" } },
        { visitorEmail: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              senderType: true,
              messageType: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: { senderType: "VISITOR", status: { not: "READ" } },
              },
            },
          },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

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
          ? {
              content: lastMessage.content,
              senderType: lastMessage.senderType,
              messageType: lastMessage.messageType,
              createdAt: lastMessage.createdAt,
            }
          : null,
        unreadCount: conversation._count.messages,
      };
    });

    return {
      message: "Inbox conversations fetched successfully",
      data: {
        conversations: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
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
