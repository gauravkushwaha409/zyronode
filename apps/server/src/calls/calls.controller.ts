import { Controller, Get, UseGuards } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { IceServersResponse } from "@package/call-signaling";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { TurnService } from "./turn.service";

@ApiTags("Calls")
@Controller("calls")
export class CallsController {
	constructor(private readonly turnService: TurnService) {}

	@Get("ice-servers")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: "Get STUN/TURN servers with short-lived credentials",
	})
	@ApiResponse({ status: 200, description: "ICE servers for WebRTC" })
	getIceServers(@CurrentUser("id") userId: string): IceServersResponse {
		return this.turnService.getIceServers(userId);
	}
}
