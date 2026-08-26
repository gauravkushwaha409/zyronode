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
import type { Request } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { ConversationService } from "./conversation.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@Controller("conversations")
export class ConversationController {
	constructor(private readonly conversationService: ConversationService) {}

	@Post()
	create(@Body() dto: CreateConversationDto, @Req() req: Request) {
		const ip =
			(req.headers["x-forwarded-for"] as string) ?? req.socket.remoteAddress;
		const userAgent = req.headers["user-agent"];
		console.log("ip===================>", ip);
		return this.conversationService.create(dto, ip, userAgent);
	}

	@Get(":id")
	findById(@Param("id") id: string) {
		return this.conversationService.findById(id);
	}

	@Get("org/:organizationId")
	@UseGuards(JwtAuthGuard)
	findByOrganization(
		@Param("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.conversationService.findByOrganizationId(organizationId);
	}

	@Patch(":id/status")
	@UseGuards(JwtAuthGuard)
	updateStatus(
		@Param("id") id: string,
		@Body("status") status: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING",
		@CurrentUser("id") userId: string,
	) {
		return this.conversationService.updateStatus(id, status);
	}
}
