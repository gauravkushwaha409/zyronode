import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConversationDto, ip?: string, userAgent?: string) {
    const conversation = await this.prisma.conversation.create({
      data: {
        organizationId: dto.organizationId,
        sourceUrl: dto.sourceUrl,
        visitorName: dto.visitorName,
        visitorEmail: dto.visitorEmail,
        visitorPhone: dto.visitorPhone,
        channel: dto.channel ?? "web",
        metadata: dto.metadata as never,
        ipAddress: ip,
        userAgent,
      },
      include: {
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      message: "Conversation created successfully",
      data: conversation,
    };
  }

  async findById(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 50,
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
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    return {
      message: "Conversation fetched successfully",
      data: conversation,
    };
  }

  async findByOrganizationId(organizationId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return {
      message: "Conversations fetched successfully",
      data: conversations,
    };
  }

  async updateStatus(
    conversationId: string,
    status: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING",
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status },
    });

    return {
      message: "Conversation status updated",
      data: updated,
    };
  }
}
