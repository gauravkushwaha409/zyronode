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
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { WidgetEventsPublisher } from "../visitor/events/widget-events.publisher";
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
		await this.widgetEvents.messageCreated({
			conversationId,
			message: result.data,
		});
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
	@ApiOperation({
		summary: "List messages in a conversation (cursor pagination)",
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
