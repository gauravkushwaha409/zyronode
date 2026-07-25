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
    sessionId: string,
    dto: SendMessageDto,
    senderType: "VISITOR" | "AGENT" | "SYSTEM",
    senderId?: string,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    if (session.status === "CLOSED" && senderType === "VISITOR") {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { status: "ACTIVE" },
      });
    }

    if (dto.messageType === "INTERNAL_NOTE" && senderType !== "AGENT") {
      throw new ForbiddenException("Only agents can send internal notes");
    }

    const message = await this.prisma.message.create({
      data: {
        sessionId,
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

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return {
      message: "Message sent successfully",
      data: message,
    };
  }

  async findBySession(sessionId: string, page = 1, limit = 50) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { sessionId },
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
      this.prisma.message.count({ where: { sessionId } }),
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

  async markAsRead(sessionId: string, senderType: "VISITOR" | "AGENT") {
    const statusField =
      senderType === "AGENT" ? "status" : "status";

    await this.prisma.message.updateMany({
      where: {
        sessionId,
        senderType: senderType === "AGENT" ? "VISITOR" : "AGENT",
        status: { not: "READ" },
      },
      data: { status: "READ" },
    });

    return { message: "Messages marked as read" };
  }
}
