// apps/backend/src/auth/auth.controller.ts
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { AuthService } from "./auth.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("register")
	register(
		@Body() dto: RegisterDto,
		@Res({ passthrough: true }) response: Response,
	) {
		return this.authService.register(dto, response);
	}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
		return this.authService.login(dto, response);
	}

	@Get("me")
	@UseGuards(JwtAuthGuard)
	me(@CurrentUser() user) {
		return this.authService.me(user.id);
	}

	@Post("logout")
	@UseGuards(JwtAuthGuard)
	logout(
		@Res({ passthrough: true }) response: Response,
		@Req() request: Request,
	) {
		console.log("Logout request received from user:", request);
		return this.authService.logout(response);
	}

	@Get("google")
	@UseGuards(AuthGuard("google"))
	googleAuth() {}

	@Get("google/callback")
	@UseGuards(AuthGuard("google"))
	async googleCallback(
		@Req() req: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const user = await this.authService.googleLogin(req.user as any, response);
		const redirectUrl = user?.lastOrgId
			? `${process.env.VITE_APP_URL}/${user.lastOrgId}/dashboard`
			: `${process.env.VITE_APP_URL}/select-organization`;
		response.redirect(redirectUrl);
	}
}
