import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { EventBridge } from "../common/services/event-bridge.service";
import { PrismaService } from "../prisma/prisma.service";
import { SseService } from "../sse/sse.service";
import { ListMessagesDto } from "./dto/list-messages.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { MessageService } from "./message.service";

@Controller("sessions/:sessionId/messages")
export class MessageController {
	constructor(
		private readonly messageService: MessageService,
		private readonly eventBridge: EventBridge,
		private readonly sseService: SseService,
		private readonly prisma: PrismaService,
	) {}

	private async broadcastMessage(sessionId: string, message: unknown) {
		const data = { session: { id: sessionId }, message };
		this.eventBridge.emitToSession(sessionId, "message:new", data);

		const session = await this.prisma.session.findUnique({
			where: { id: sessionId },
			select: { organizationId: true },
		});
		if (session?.organizationId) {
			this.eventBridge.emitToOrg(session.organizationId, "message:new", data);

			// SSE fanout: agents of the tenant + visitors of this session
			await this.sseService.publish(
				[`org:${session.organizationId}`, `session:${sessionId}`],
				"message.created",
				data,
			);
		}
	}

	@Post()
	@UseGuards(JwtAuthGuard)
	async sendAsAgent(
		@Param("sessionId") sessionId: string,
		@Body() dto: SendMessageDto,
		@CurrentUser("id") userId: string,
	) {
		const result = await this.messageService.create(
			sessionId,
			dto,
			"AGENT",
			userId,
		);
		await this.broadcastMessage(sessionId, result.data);
		return result;
	}

	@Post("visitor")
	async sendAsVisitor(
		@Param("sessionId") sessionId: string,
		@Body() dto: SendMessageDto,
	) {
		const result = await this.messageService.create(sessionId, dto, "VISITOR");
		await this.broadcastMessage(sessionId, result.data);
		return result;
	}

	@Get()
	findBySession(
		@Param("sessionId") sessionId: string,
		@Query() query: ListMessagesDto,
	) {
		return this.messageService.findBySession(
			sessionId,
			query.page ?? 1,
			query.limit ?? 50,
		);
	}

	@Post("read")
	@UseGuards(JwtAuthGuard)
	markAsRead(
		@Param("sessionId") sessionId: string,
		@CurrentUser("id") userId: string,
	) {
		return this.messageService.markAsRead(sessionId, "AGENT");
	}
}
