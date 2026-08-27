import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { EventBridge } from "../common/services/event-bridge.service";
import { PrismaService } from "../prisma/prisma.service";
import { SseService } from "../sse/sse.service";
import { ListMessagesDto } from "./dto/list-messages.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { MessageService } from "./message.service";

@ApiTags("Message")
@Controller("conversations/:conversationId/messages")
export class MessageController {
	constructor(
		private readonly messageService: MessageService,
		private readonly eventBridge: EventBridge,
		private readonly sseService: SseService,
		private readonly prisma: PrismaService,
	) {}

	private async getOrganizationId(
		conversationId: string,
	): Promise<string | null> {
		const conversation = await this.prisma.conversation.findUnique({
			where: { id: conversationId },
			select: { organizationId: true },
		});
		return conversation?.organizationId ?? null;
	}

	private broadcastViaWebsocket(
		conversationId: string,
		organizationId: string | null,
		message: unknown,
	) {
		const data = { conversation: { id: conversationId }, message };
		this.eventBridge.emitToConversation(conversationId, "message:new", data);
		if (organizationId) {
			this.eventBridge.emitToOrg(organizationId, "message:new", data);
		}
	}

	private broadcastViaSse(
		conversationId: string,
		organizationId: string | null,
		message: unknown,
	) {
		if (!organizationId) return;
		return this.sseService.publish(
			[`org:${organizationId}`, `conversation:${conversationId}`],
			"message.created",
			{ conversation: { id: conversationId }, message },
		);
	}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Send a message as an agent' })
	@ApiParam({ name: 'conversationId', description: 'Conversation ID' })
	@ApiResponse({ status: 201, description: 'Message sent' })
	async sendAsAgent(
		@Param("conversationId") conversationId: string,
		@Body() dto: SendMessageDto,
		@CurrentUser("id") userId: string,
	) {
		const result = await this.messageService.create(
			conversationId,
			dto,
			"AGENT",
			userId,
		);
		const organizationId = await this.getOrganizationId(conversationId);
		await Promise.all([
			this.broadcastViaWebsocket(conversationId, organizationId, result.data),
			this.broadcastViaSse(conversationId, organizationId, result.data),
		]);
		return result;
	}

	@Post("visitor")
	@ApiOperation({ summary: 'Send a message as a visitor' })
	@ApiParam({ name: 'conversationId', description: 'Conversation ID' })
	@ApiResponse({ status: 201, description: 'Message sent' })
	async sendAsVisitor(
		@Param("conversationId") conversationId: string,
		@Body() dto: SendMessageDto,
	) {
		const result = await this.messageService.create(
			conversationId,
			dto,
			"VISITOR",
		);
		const organizationId = await this.getOrganizationId(conversationId);
		await Promise.all([
			this.broadcastViaWebsocket(conversationId, organizationId, result.data),
			this.broadcastViaSse(conversationId, organizationId, result.data),
		]);
		return result;
	}

	@Get()
	@ApiOperation({ summary: 'List messages in a conversation' })
	@ApiParam({ name: 'conversationId', description: 'Conversation ID' })
	@ApiResponse({ status: 200, description: 'Messages returned' })
	findByConversation(
		@Param("conversationId") conversationId: string,
		@Query() query: ListMessagesDto,
	) {
		return this.messageService.findByConversation(
			conversationId,
			query.page ?? 1,
			query.limit ?? 50,
		);
	}

	@Post("read")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Mark conversation as read' })
	@ApiParam({ name: 'conversationId', description: 'Conversation ID' })
	@ApiResponse({ status: 200, description: 'Marked as read' })
	markAsRead(
		@Param("conversationId") conversationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.messageService.markAsRead(conversationId, "AGENT");
	}
}
