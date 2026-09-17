import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { InboxSsePublisher } from "./inbox-sse.publisher";

@Injectable()
export class ConversationService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly inboxSse: InboxSsePublisher,
	) {}

	async create(dto: CreateConversationDto, ip?: string, userAgent?: string) {
		return this.createConversation(dto, ip, userAgent);
	}

	async createConversation(
		dto: CreateConversationDto,
		ip?: string,
		userAgent?: string,
	) {
		try {
			const visitor = await this.prisma.visitor.findFirst({
				where: { id: dto.visitorId, organizationId: dto.organizationId },
				select: { id: true },
			});
			if (!visitor) {
				throw new BadRequestException(
					"Invalid visitorId for organization",
				);
			}

			const conversation = await this.prisma.conversation.create({
				data: {
					organizationId: dto.organizationId,
					visitorId: dto.visitorId,
					channel: dto.channel ?? "web",
					...(ip ? { ipAddress: ip } : {}),
					...(userAgent ? { userAgent } : {}),
				},
				include: {
					organization: {
						select: { id: true, name: true },
					},
					visitor: {
						select: { id: true, name: true, email: true },
					},
				},
			});

			await this.inboxSse.conversationCreated({
				conversationId: conversation.id,
				organizationId: conversation.organizationId,
				conversation,
			});

			return {
				message: "Conversation created successfully",
				data: conversation,
			};
		} catch (err) {
			const error = err as Prisma.PrismaClientKnownRequestError;
			if (error.code === "P2003") {
				throw new BadRequestException(
					"Invalid organization. Please provide a valid organization ID.",
				);
			}

			throw error;
		}
	}

  async findById(conversationId: string) {
		const conversation = await this.prisma.conversation.findFirst({
			where: { id: conversationId, deletedAt: null },
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
			where: { organizationId, deletedAt: null },
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
		const conversation = await this.prisma.conversation.findFirst({
			where: { id: conversationId, deletedAt: null },
		});

		if (!conversation) {
			throw new NotFoundException("Conversation not found");
		}

		const updated = await this.prisma.conversation.update({
			where: { id: conversationId },
			data: { status },
		});

		await this.inboxSse.conversationUpdated({
			conversationId,
			organizationId: updated.organizationId,
			conversation: updated,
		});

		return {
			message: "Conversation status updated",
			data: updated,
		};
	}
}
