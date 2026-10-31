import {
	Body,
	Controller,
	Delete,
	Headers,
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
import { RegisterPushTokenDto } from "./dto/register-push-token.dto";
import { PushTokensService } from "./push-tokens.service";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
	constructor(private readonly pushTokens: PushTokensService) {}

	@Post("tokens")
	@ApiOperation({ summary: "Register this browser's FCM push token" })
	@ApiResponse({ status: 201, description: "Token registered" })
	async register(
		@CurrentUser("id") userId: string,
		@Body() dto: RegisterPushTokenDto,
		@Headers("user-agent") userAgent?: string,
	) {
		const row = await this.pushTokens.registerForUser(userId, {
			token: dto.token,
			userAgent: dto.userAgent ?? userAgent,
		});
		return {
			message: "Push token registered",
			data: { id: row.id },
		};
	}

	@Delete("tokens/:token")
	@HttpCode(200)
	@ApiOperation({ summary: "Unregister this browser's FCM push token" })
	@ApiParam({ name: "token", description: "FCM registration token" })
	@ApiResponse({ status: 200, description: "Token removed" })
	async remove(
		@CurrentUser("id") userId: string,
		@Param("token") token: string,
	) {
		await this.pushTokens.removeForUser(userId, token);
		return { message: "Push token removed", data: null };
	}
}
