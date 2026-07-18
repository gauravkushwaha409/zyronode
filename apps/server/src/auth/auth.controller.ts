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
import { EmailVerifiedGuard } from "../common/gaurds/email-verified.guard";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { OnboardingGuard } from "../common/gaurds/onboarding.guard";
import { AuthService } from "./auth.service";
import type { ForgotPasswordDto } from "./dto/forgot-password.dto";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";
import type { SetPasswordDto } from "./dto/set-password.dto";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("sign-up")
	signUp(
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
	@UseGuards(JwtAuthGuard, EmailVerifiedGuard, OnboardingGuard)
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

	@Post("password/forgot")
	@HttpCode(HttpStatus.OK)
	forgotPassword(@Body() dto: ForgotPasswordDto) {
		return this.authService.forgotPassword(dto);
	}

	@Post("password/forgot/verify")
	@HttpCode(HttpStatus.OK)
	setPassword(@Body() dto: SetPasswordDto) {
		return this.authService.setPassword(dto);
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
