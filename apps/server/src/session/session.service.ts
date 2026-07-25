import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSessionDto } from "./dto/create-session.dto";

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSessionDto, ip?: string, userAgent?: string) {
    const session = await this.prisma.session.create({
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
      message: "Session created successfully",
      data: session,
    };
  }

  async findById(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
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

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    return {
      message: "Session fetched successfully",
      data: session,
    };
  }

  async findByOrganizationId(organizationId: string) {
    const sessions = await this.prisma.session.findMany({
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
      message: "Sessions fetched successfully",
      data: sessions,
    };
  }

  async updateStatus(
    sessionId: string,
    status: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING",
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status },
    });

    return {
      message: "Session status updated",
      data: updated,
    };
  }
}
