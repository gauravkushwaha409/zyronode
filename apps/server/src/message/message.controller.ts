import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { EventBridge } from "../common/services/event-bridge.service";
import { PrismaService } from "../prisma/prisma.service";
import { SseService } from "../sse/sse.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { ListMessagesDto } from "./dto/list-messages.dto";
import { MessageService } from "./message.service";

@Controller("conversations/:conversationId/messages")
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly eventBridge: EventBridge,
    private readonly sseService: SseService,
    private readonly prisma: PrismaService,
  ) {}

  private async broadcastMessage(conversationId: string, message: unknown) {
    const data = { conversation: { id: conversationId }, message };
    this.eventBridge.emitToConversation(conversationId, "message:new", data);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { organizationId: true },
    });
    if (conversation?.organizationId) {
      this.eventBridge.emitToOrg(conversation.organizationId, "message:new", data);

      // SSE fanout: agents of the tenant + visitors of this conversation
      await this.sseService.publish(
        [`org:${conversation.organizationId}`, `conversation:${conversationId}`],
        "message.created",
        data,
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
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
    await this.broadcastMessage(conversationId, result.data);
    return result;
  }

  @Post("visitor")
  async sendAsVisitor(
    @Param("conversationId") conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    const result = await this.messageService.create(
      conversationId,
      dto,
      "VISITOR",
    );
    await this.broadcastMessage(conversationId, result.data);
    return result;
  }

  @Get()
  findByConversation(
    @Param("conversationId") conversationId: string,
    @Query() query: ListMessagesDto,
  ) {
    return this.messageService.findByConversation(
      conversationId,
      query.page ?? 1,
      query.limit ?? 50,
    );
  }

  @Post("read")
  @UseGuards(JwtAuthGuard)
  markAsRead(
    @Param("conversationId") conversationId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.messageService.markAsRead(conversationId, "AGENT");
  }
}
