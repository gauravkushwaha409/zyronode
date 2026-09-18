import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { WidgetEventsPublisher } from "../visitor/events/widget-events.publisher";
import { EditMessageDto } from "./dto/edit-message.dto";
import { ListMessagesDto } from "./dto/list-messages.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { MessageService } from "./message.service";

@ApiTags("Message")
@Controller("conversations/:conversationId/messages")
export class MessageController {
	constructor(
		private readonly messageService: MessageService,
		private readonly widgetEvents: WidgetEventsPublisher,
	) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Send a message as an agent" })
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 201, description: "Message sent" })
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
		// Internal notes go through InternalNotesController's org-only-scoped
		// SSE emit — never the conversation-keyed broadcast here, which the
		// visitor widget's stream also subscribes to. This generic endpoint
		// still technically accepts messageType=INTERNAL_NOTE (kept for the
		// existing MessageService contract), so guard it defensively too.
		if (dto.messageType !== "INTERNAL_NOTE") {
			await this.widgetEvents.messageCreated({
				conversationId,
				message: result.data,
			});
		}
		return result;
	}

	@Post("visitor")
	@ApiOperation({ summary: "Send a message as a visitor" })
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 201, description: "Message sent" })
	async sendAsVisitor(
		@Param("conversationId") conversationId: string,
		@Body() dto: SendMessageDto,
	) {
		const result = await this.messageService.create(
			conversationId,
			dto,
			"VISITOR",
		);
		await this.widgetEvents.messageCreated({
			conversationId,
			message: result.data,
		});
		return result;
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: "List messages in a conversation (cursor pagination, agent-only — widget uses GET /widget/conversations/:id/messages)",
	})
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Messages returned" })
	findByConversation(
		@Param("conversationId") conversationId: string,
		@Query() query: ListMessagesDto,
	) {
		return this.messageService.findByConversation(conversationId, {
			limit: query.limit,
			cursor: query.cursor,
			direction: query.direction,
		});
	}

	@Patch(":messageId")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Edit your own message" })
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiParam({ name: "messageId", description: "Message ID" })
	@ApiResponse({ status: 200, description: "Message edited" })
	async edit(
		@Param("conversationId") conversationId: string,
		@Param("messageId") messageId: string,
		@Body() dto: EditMessageDto,
		@CurrentUser("id") userId: string,
	) {
		const result = await this.messageService.edit(
			conversationId,
			messageId,
			userId,
			dto.content,
		);
		await this.widgetEvents.messageUpdated({
			conversationId,
			message: result.data,
		});
		return result;
	}

	@Delete(":messageId")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Delete your own message (soft delete)" })
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiParam({ name: "messageId", description: "Message ID" })
	@ApiResponse({ status: 200, description: "Message deleted" })
	async remove(
		@Param("conversationId") conversationId: string,
		@Param("messageId") messageId: string,
		@CurrentUser("id") userId: string,
	) {
		const result = await this.messageService.softDelete(
			conversationId,
			messageId,
			userId,
		);
		await this.widgetEvents.messageDeleted({ conversationId, messageId });
		return result;
	}

	@Post("read")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Mark conversation as read" })
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Marked as read" })
	markAsRead(
		@Param("conversationId") conversationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.messageService.markAsRead(conversationId, "AGENT");
	}
}
