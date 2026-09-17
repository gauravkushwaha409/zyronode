import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { ConversationService } from "./conversation.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@ApiTags("Conversations")
@Controller("conversations")
export class ConversationController {
	constructor(private readonly conversationService: ConversationService) {}

	@Post()
	@ApiOperation({ summary: "Create a new conversation" })
	@ApiResponse({ status: 201, description: "Conversation created" })
	create(@Body() dto: CreateConversationDto,) {
		return this.conversationService.createConversation(dto);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get conversation by ID" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Conversation returned" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	findById(@Param("id") id: string) {
		return this.conversationService.findById(id);
	}

	@Get("org/:organizationId")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Get conversations for an organization" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Conversations returned" })
	findByOrganization(
		@Param("organizationId") organizationId: string,
	) {
		return this.conversationService.findByOrganizationId(organizationId);
	}

	@Patch(":id/status")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Update conversation status" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Status updated" })
	updateStatus(
		@Param("id") id: string,
		@Body("status") status: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING",
	) {
		return this.conversationService.updateStatus(id, status);
	}
}
