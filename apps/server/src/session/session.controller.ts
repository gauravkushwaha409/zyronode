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
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { CreateSessionDto } from "./dto/create-session.dto";
import { SessionService } from "./session.service";

@Controller("sessions")
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create(@Body() dto: CreateSessionDto, @Req() req: Request) {
    const ip =
      (req.headers["x-forwarded-for"] as string) ?? req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    return this.sessionService.create(dto, ip, userAgent);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.sessionService.findById(id);
  }

  @Get("org/:organizationId")
  @UseGuards(JwtAuthGuard)
  findByOrganization(
    @Param("organizationId") organizationId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.sessionService.findByOrganizationId(organizationId);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param("id") id: string,
    @Body("status") status: "ACTIVE" | "IDLE" | "CLOSED" | "PENDING",
    @CurrentUser("id") userId: string,
  ) {
    return this.sessionService.updateStatus(id, status);
  }
}
