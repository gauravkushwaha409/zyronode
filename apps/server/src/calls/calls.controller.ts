import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { IceServersResponse } from "@package/call-signaling";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { CallsService } from "./calls.service";
import { CallHistoryQueryDto } from "./dto/call.dto";
import { TurnService } from "./turn.service";

@ApiTags("Calls")
@Controller("calls")
export class CallsController {
	constructor(
		private readonly turnService: TurnService,
		private readonly callsService: CallsService,
	) {}

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

	@Get("history")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: "List call history for a conversation (cursor-paginated)",
	})
	@ApiResponse({ status: 200, description: "Call history page" })
	getHistory(
		@CurrentUser("id") userId: string,
		@Query() query: CallHistoryQueryDto,
	) {
		return this.callsService.getCallHistory(
			this.callsService.peerIdOfUser(userId),
			query.conversationId,
			query.cursor,
			query.limit ?? 20,
		);
	}
}
