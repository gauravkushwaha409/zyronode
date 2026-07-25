import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  async getSessions(
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

    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
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
      this.prisma.session.count({ where }),
    ]);

    const data = sessions.map((session) => {
      const lastMessage = session.messages[0] ?? null;
      return {
        id: session.id,
        status: session.status,
        channel: session.channel,
        visitorName: session.visitorName,
        visitorEmail: session.visitorEmail,
        lastMessageAt: session.updatedAt,
        createdAt: session.createdAt,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderType: lastMessage.senderType,
              messageType: lastMessage.messageType,
              createdAt: lastMessage.createdAt,
            }
          : null,
        unreadCount: session._count.messages,
      };
    });

    return {
      message: "Inbox sessions fetched successfully",
      data: {
        sessions: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getSessionDetails(organizationId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, organizationId },
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

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    return {
      message: "Session details fetched successfully",
      data: session,
    };
  }

  async closeSession(organizationId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, organizationId },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: "CLOSED" },
    });

    return {
      message: "Session closed successfully",
      data: updated,
    };
  }

  async reopenSession(organizationId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, organizationId },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: "ACTIVE" },
    });

    return {
      message: "Session reopened successfully",
      data: updated,
    };
  }
}
