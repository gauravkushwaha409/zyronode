import {
	BadRequestException,
	Body,
	Controller,
	ForbiddenException,
	HttpCode,
	Param,
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
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "./ai.service";
import { RewriteDto } from "./dto/rewrite.dto";
import { SuggestReplyDto } from "./dto/suggest-reply.dto";

@ApiTags("AI")
@Controller("ai")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
	constructor(
		private readonly aiService: AiService,
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

	@Post("rewrite")
	@HttpCode(200)
	@ApiOperation({ summary: "Rewrite the agent's draft with an AI action" })
	@ApiResponse({ status: 200, description: "Rewritten text returned" })
	async rewrite(@Body() dto: RewriteDto) {
		return this.aiService.rewrite(dto.text, dto.action);
	}

	@Post("conversations/:conversationId/suggest-reply")
	@HttpCode(200)
	@ApiOperation({
		summary: "Suggest the agent's next reply from recent messages",
	})
	@ApiParam({ name: "conversationId", description: "Conversation ID" })
	@ApiResponse({ status: 200, description: "Suggested reply returned" })
	async suggestReply(
		@Param("conversationId") conversationId: string,
		@Body() dto: SuggestReplyDto,
		@CurrentUser("id") userId: string,
	) {
		await this.assertMembership(userId, dto.organizationId);
		return this.aiService.suggestReply(conversationId, dto.organizationId);
	}
}
