import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { Request } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { ConversationService } from "./conversation.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@ApiTags("Conversation")
@Controller("conversations")
export class ConversationController {
	constructor(private readonly conversationService: ConversationService) {}

	@Post()
	@ApiOperation({ summary: "Create a new conversation" })
	@ApiResponse({ status: 201, description: "Conversation created" })
	create(@Body() dto: CreateConversationDto, @Req() req: Request) {
		const ip =
			(req.headers["x-forwarded-for"] as string) ?? req.socket.remoteAddress;
		const userAgent = req.headers["user-agent"];
		return this.conversationService.create(dto, ip, userAgent);
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
		@CurrentUser("id") userId: string,
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
		@CurrentUser("id") userId: string,
	) {
		return this.conversationService.updateStatus(id, status);
	}
}
