import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInternalNoteDto } from "./dto/create-internal-note.dto";
import { ListInternalNotesDto } from "./dto/list-internal-notes.dto";
import { InternalNotesService } from "./internal-notes.service";

@ApiTags("Inbox / Internal Notes")
@Controller("inbox/conversations/:conversationId/internal-notes")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InternalNotesController {
	constructor(
		private readonly internalNotesService: InternalNotesService,
		private readonly prisma: PrismaService,
	) {}

	private async assertMembership(userId: string, organizationId: string) {
		if (!organizationId) {
			throw new BadRequestException("organizationId is required");
		}
		const membership = await this.prisma.organizationMember.findUnique({
			where: { userId_organizationId: { userId, organizationId } },
		});
		if (!membership) {
			throw new ForbiddenException("You are not a member of this organization");
		}
	}

	@Post()
	@ApiOperation({ summary: "Add an internal note to a conversation (agent-only, never visible to visitor)" })
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 201, description: "Internal note created" })
	async create(
		@Param("conversationId") conversationId: string,
		@Query("organizationId") organizationId: string,
		@Body() dto: CreateInternalNoteDto,
		@CurrentUser("id") userId: string,
	) {
		await this.assertMembership(userId, organizationId);
		return this.internalNotesService.create(organizationId, conversationId, userId, dto.content, dto.replyToId);
	}

	@Get()
	@ApiOperation({ summary: "List internal notes on a conversation (cursor pagination)" })
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Internal notes returned" })
	async findByConversation(
		@Param("conversationId") conversationId: string,
		@Query("organizationId") organizationId: string,
		@Query() query: ListInternalNotesDto,
		@CurrentUser("id") userId: string,
	) {
		await this.assertMembership(userId, organizationId);
		return this.internalNotesService.findByConversation(organizationId, conversationId, {
			limit: query.limit,
			cursor: query.cursor,
			direction: query.direction,
		});
	}
}
