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
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { EmailVerifiedGuard } from "../common/gaurds/email-verified.guard";
import { JwtAuthGuard } from "../common/gaurds/jwt-auth.guard";
import { OnboardingGuard } from "../common/gaurds/onboarding.guard";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { SetPasswordDto } from "./dto/set-password.dto";
import { UserOnboardingDto } from "./dto/user-onboarding.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("sign-up")
	@ApiOperation({ summary: "Register a new user account" })
	@ApiResponse({ status: 201, description: "User registered successfully" })
	@ApiResponse({ status: 409, description: "Email already exists" })
	signUp(
		@Body() dto: RegisterDto,
		@Res({ passthrough: true }) response: Response,
	) {
		return this.authService.register(dto, response);
	}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Login with email and password" })
	@ApiResponse({ status: 200, description: "Login successful" })
	@ApiResponse({ status: 401, description: "Invalid credentials" })
	login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
		return this.authService.login(dto, response);
	}

	@Get("me")
	@UseGuards(JwtAuthGuard, EmailVerifiedGuard, OnboardingGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Get current authenticated user profile" })
	@ApiResponse({ status: 200, description: "User profile returned" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	me(@CurrentUser() user) {
		return this.authService.me(user.id);
	}

	@Post("logout")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Logout current user" })
	@ApiResponse({ status: 200, description: "Logged out successfully" })
	logout(
		@Res({ passthrough: true }) response: Response,
		@Req() request: Request,
	) {
		console.log("Logout request received from user:", request);
		return this.authService.logout(response);
	}

	@Post("password/forgot")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Request a password reset email" })
	@ApiResponse({ status: 200, description: "Password reset email sent" })
	forgotPassword(@Body() dto: ForgotPasswordDto) {
		return this.authService.forgotPassword(dto);
	}

	@Post("password/forgot/verify")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Set new password using reset token" })
	@ApiResponse({ status: 200, description: "Password updated successfully" })
	@ApiResponse({ status: 400, description: "Invalid or expired token" })
	setPassword(@Body() dto: SetPasswordDto) {
		return this.authService.setPassword(dto);
	}

	@Post("resend-verification")
	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Resend email verification code" })
	@ApiResponse({ status: 200, description: "Verification email sent" })
	resendVerification(@CurrentUser() user: { id: string }) {
		console.log("Resend verification request received from user:", user);
		return this.authService.resendVerification(user.id);
	}

	@Post("verify-email")
	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Verify email address with 6-digit code" })
	@ApiResponse({ status: 200, description: "Email verified successfully" })
	@ApiResponse({ status: 400, description: "Invalid verification code" })
	verifyEmail(@CurrentUser() user: { id: string }, @Body() dto: VerifyEmailDto) {
		return this.authService.verifyEmail(user.id, dto.code);
	}

	@Post("user-onboarding")
	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Complete user onboarding" })
	@ApiResponse({ status: 200, description: "Onboarding completed" })
	userOnboarding(
		@CurrentUser() user: { id: string },
		@Body() dto: UserOnboardingDto,
	) {
		return this.authService.userOnboarding(user.id, dto);
	}

	@Get("google")
	@UseGuards(AuthGuard("google"))
	@ApiOperation({ summary: "Initiate Google OAuth login" })
	googleAuth() {}

	@Get("google/callback")
	@UseGuards(AuthGuard("google"))
	@ApiOperation({ summary: "Google OAuth callback" })
	async googleCallback(
		@Req() req: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const user = await this.authService.googleLogin(req.user as any, response);
		const appUrl = (process.env.VITE_APP_URL ?? "").replace(/\$\{([^}]+)\}|\$([A-Z0-9_]+)/g, (_, b, c) => process.env[b ?? c] ?? "") || `http://localhost:${process.env.APP_PORT ?? "3000"}`;
		const redirectUrl = user?.lastOrgId
			? `${appUrl}/${user.lastOrgId}/dashboard`
			: `${appUrl}/select-organization`;
		response.redirect(redirectUrl);
	}
}
