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
import { SendMessageDto } from "./dto/send-message.dto";
import { ListMessagesDto } from "./dto/list-messages.dto";
import { MessageService } from "./message.service";

@Controller("sessions/:sessionId/messages")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  sendAsAgent(
    @Param("sessionId") sessionId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.messageService.create(sessionId, dto, "AGENT", userId);
  }

  @Post("visitor")
  sendAsVisitor(
    @Param("sessionId") sessionId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messageService.create(sessionId, dto, "VISITOR");
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
