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
import { InboxService } from "./inbox.service";
import { ListInboxConversationsDto } from "./dto/list-inbox-conversations.dto";

@Controller("inbox")
@UseGuards(JwtAuthGuard)
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get("conversations")
  getConversations(
    @Query() query: ListInboxConversationsDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.inboxService.getConversations(query.organizationId, {
      status: query.status,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get("conversations/:id")
  getConversationDetails(
    @Param("id") id: string,
    @Query("organizationId") organizationId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.inboxService.getConversationDetails(organizationId, id);
  }

  @Post("conversations/:id/close")
  closeConversation(
    @Param("id") id: string,
    @Body("organizationId") organizationId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.inboxService.closeConversation(organizationId, id);
  }

  @Post("conversations/:id/reopen")
  reopenConversation(
    @Param("id") id: string,
    @Body("organizationId") organizationId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.inboxService.reopenConversation(organizationId, id);
  }
}
