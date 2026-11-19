import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Res,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { AdminAuthService } from "./admin-auth.service";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { AdminJwtAuthGuard } from "./gaurds/admin-jwt-auth.guard";
import { PlatformAdminGuard } from "./gaurds/platform-admin.guard";

@ApiTags("Admin Auth")
@Controller("admin/auth")
export class AdminAuthController {
	constructor(private adminAuthService: AdminAuthService) {}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Login to the platform admin console" })
	@ApiResponse({ status: 200, description: "Admin login successful" })
	@ApiResponse({ status: 401, description: "Invalid credentials" })
	login(
		@Body() dto: AdminLoginDto,
		@Res({ passthrough: true }) response: Response,
	) {
		return this.adminAuthService.login(dto, response);
	}

	@Get("me")
	@UseGuards(AdminJwtAuthGuard, PlatformAdminGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Get the current platform admin" })
	@ApiResponse({ status: 200, description: "Admin profile returned" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Not a platform admin" })
	me(@CurrentUser() user: { id: string }) {
		return this.adminAuthService.me(user.id);
	}

	@Post("logout")
	@HttpCode(HttpStatus.OK)
	@UseGuards(AdminJwtAuthGuard, PlatformAdminGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Logout the platform admin" })
	@ApiResponse({ status: 200, description: "Admin logged out successfully" })
	logout(@Res({ passthrough: true }) response: Response) {
		return this.adminAuthService.logout(response);
	}
}
