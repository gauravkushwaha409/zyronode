import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
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
import { PrismaService } from "../prisma/prisma.service";
import { ConversationService } from "./conversation.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { ListInboxConversationsDto } from "./dto/list-inbox-conversations.dto";
import { InboxService } from "./inbox.service";

/**
 * Merged controller — single entry point for all conversation/inbox
 * operations. Fixes gaps between the former `InboxController` (org-scoped,
 * paginated, guarded) and `ConversationController` (public, unpaginated,
 * no membership check):
 * - All org-scoped reads now require `organizationId` + `JwtAuthGuard`
 *   + `organizationMember` check (consistent with `SseController:80`)
 * - `GET /conversations/:id` now org-scoped (was `deletedAt` only)
 * - `GET /conversations/org/:id` deprecated → use `GET /inbox/conversations` pagination
 * - `PATCH /conversations/:id/status` now requires org membership
 * - `POST /conversations` now guarded (widget uses `POST /widget/conversations`)
 */
@ApiTags("Inbox / Conversations")
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InboxController {
	constructor(
		private readonly inboxService: InboxService,
		private readonly conversationService: ConversationService,
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

	// ── Inbox (agent dashboard) ──────────────────────────────────────

	@Get("inbox/conversations")
	@ApiOperation({ summary: "List inbox conversations (cursor pagination, bidirectional)" })
	@ApiResponse({ status: 200, description: "Conversations returned" })
	async getConversations(
		@Query() query: ListInboxConversationsDto,
		@CurrentUser("id") userId: string,
	) {
		await this.assertMembership(userId, query.organizationId);
		return this.inboxService.getConversations(query.organizationId, {
			status: query.status,
			search: query.search,
			limit: query.limit,
			cursor: query.cursor,
			direction: query.direction,
		});
	}

	@Get("inbox/conversations/unread-stats/analytics")
	@ApiOperation({ summary: "Get unread conversation stats (dummy, not org-scoped yet)" })
	@ApiResponse({ status: 200, description: "Unread stats returned" })
	unreadStats() {
		return this.inboxService.unreadStats();
	}

	@Get("inbox/conversations/:id")
	@ApiOperation({ summary: "Get conversation details (org-scoped)" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Conversation details returned" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	async getConversationDetails(
		@Param("id") id: string,
		@Query("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		if (!organizationId) {
			throw new BadRequestException("organizationId query param is required");
		}
		await this.assertMembership(userId, organizationId);
		return this.inboxService.getConversationDetails(organizationId, id);
	}

	@Post("inbox/conversations/:id/close")
	@ApiOperation({ summary: "Close a conversation" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Conversation closed" })
	async closeConversation(
		@Param("id") id: string,
		@Body("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		await this.assertMembership(userId, organizationId);
		return this.inboxService.closeConversation(organizationId, id);
	}

	@Post("inbox/conversations/:id/reopen")
	@ApiOperation({ summary: "Reopen a conversation" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Conversation reopened" })
	async reopenConversation(
		@Param("id") id: string,
		@Body("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		await this.assertMembership(userId, organizationId);
		return this.inboxService.reopenConversation(organizationId, id);
	}

	@Delete("inbox/conversations/:id")
	@ApiOperation({ summary: "Soft delete a conversation (any org member)" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Conversation deleted" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	async softDeleteConversation(
		@Param("id") id: string,
		@Query("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		if (!organizationId) {
			throw new BadRequestException("organizationId query param is required");
		}
		await this.assertMembership(userId, organizationId);
		return this.inboxService.softDeleteConversation(organizationId, id, userId);
	}

	// ── Conversations (merged from ConversationController) ───────────

	@Post("conversations")
	@ApiOperation({ summary: "Create a new conversation (org-member only; widget uses POST /widget/conversations)" })
	@ApiResponse({ status: 201, description: "Conversation created" })
	async create(
		@Body() dto: CreateConversationDto,
		@CurrentUser("id") userId: string,
	) {
		await this.assertMembership(userId, dto.organizationId);
		return this.conversationService.createConversation(dto);
	}

	@Get("conversations/:id")
	@ApiOperation({ summary: "Get conversation by ID (org-scoped, replaces unscoped read)" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Conversation returned" })
	@ApiResponse({ status: 404, description: "Conversation not found" })
	async findById(
		@Param("id") id: string,
		@Query("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
	) {
		if (!organizationId) {
			throw new BadRequestException("organizationId query param is required");
		}
		await this.assertMembership(userId, organizationId);
		// Prefer org-scoped detail (includes asc messages + replyTo); fallback to legacy unscoped if needed
		return this.inboxService.getConversationDetails(organizationId, id);
	}

	@Get("conversations/org/:organizationId")
	@ApiOperation({ summary: "Get conversations for an organization (deprecated — use GET /inbox/conversations)" })
	@ApiParam({ name: "organizationId", description: "Organization ID" })
	@ApiResponse({ status: 200, description: "Conversations returned" })
	async findByOrganization(
		@Param("organizationId") organizationId: string,
		@Query() query: ListInboxConversationsDto,
		@CurrentUser("id") userId: string,
	) {
		await this.assertMembership(userId, organizationId);
		// Delegate to paginated, presence-aware inbox listing for consistency
		return this.inboxService.getConversations(organizationId, {
			status: query.status,
			search: query.search,
			limit: query.limit,
			cursor: query.cursor,
			direction: query.direction,
		});
	}

	@Patch("conversations/:id/status")
	@ApiOperation({ summary: "Update conversation status (org-member only)" })
	@ApiParam({ name: "id", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Status updated" })
	async updateStatus(
		@Param("id") id: string,
		@Query("organizationId") organizationId: string,
		@CurrentUser("id") userId: string,
		@Body() body: { status: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING"; organizationId?: string },
	) {
		const orgId = organizationId ?? body.organizationId;
		if (!orgId) {
			throw new BadRequestException("organizationId query/body param is required");
		}
		await this.assertMembership(userId, orgId);
		// Verify conversation belongs to org before status change
		const conversation = await this.prisma.conversation.findFirst({
			where: { id, organizationId: orgId, deletedAt: null },
			select: { id: true },
		});
		if (!conversation) {
			throw new BadRequestException("Conversation not found for organization");
		}
		return this.conversationService.updateStatus(id, body.status);
	}
}
