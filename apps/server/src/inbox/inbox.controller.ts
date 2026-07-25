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
import { ListInboxSessionsDto } from "./dto/list-inbox-sessions.dto";

@Controller("inbox")
@UseGuards(JwtAuthGuard)
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get("sessions")
  getSessions(
    @Query() query: ListInboxSessionsDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.inboxService.getSessions(query.organizationId, {
      status: query.status,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get("sessions/:id")
  getSessionDetails(
    @Param("id") id: string,
    @Query("organizationId") organizationId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.inboxService.getSessionDetails(organizationId, id);
  }

  @Post("sessions/:id/close")
  closeSession(
    @Param("id") id: string,
    @Body("organizationId") organizationId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.inboxService.closeSession(organizationId, id);
  }

  @Post("sessions/:id/reopen")
  reopenSession(
    @Param("id") id: string,
    @Body("organizationId") organizationId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.inboxService.reopenSession(organizationId, id);
  }
}
