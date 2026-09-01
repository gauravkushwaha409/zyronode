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
import { ListInboxConversationsDto } from "./dto/list-inbox-conversations.dto";
import { InboxService } from "./inbox.service";

@ApiTags("Inbox")
@Controller("inbox")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InboxController {
	constructor(private readonly inboxService: InboxService) {}

	@Get("conversations")
	@ApiOperation({ summary: "List inbox conversations (cursor pagination, bidirectional)" })
	@ApiResponse({ status: 200, description: "Conversations returned" })
	getConversations(
		@Query() query: ListInboxConversationsDto,
		@CurrentUser("id") userId: string,
	) {
		return this.inboxService.getConversations(query.organizationId, {
			status: query.status,
			search: query.search,
			limit: query.limit,
			cursor: query.cursor,
			direction: query.direction,
		});
	}

	@Get("conversations/:id")
	@ApiOperation({ summary: "Get conversation details" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Conversation details returned" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	getConversationDetails(
		@Param("id") id: string,
		@Query("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.inboxService.getConversationDetails(organizationId, id);
	}

	@Post("conversations/:id/close")
	@ApiOperation({ summary: "Close a conversation" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Conversation closed" })
	closeConversation(
		@Param("id") id: string,
		@Body("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.inboxService.closeConversation(organizationId, id);
	}

	@Post("conversations/:id/reopen")
	@ApiOperation({ summary: "Reopen a conversation" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Conversation reopened" })
	reopenConversation(
		@Param("id") id: string,
		@Body("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.inboxService.reopenConversation(organizationId, id);
	}
}
