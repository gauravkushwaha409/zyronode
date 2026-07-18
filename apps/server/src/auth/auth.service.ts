// apps/server/src/auth/auth.service.ts
import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import * as bcryptjs from "bcryptjs";
import { randomBytes } from "crypto";
import type { Response } from "express";
import { Resend } from "resend";
import { OtpService } from "../otp/otp.service";
import { OtpPurpose } from "../otp/types/otp-purpose.type";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { GoogleProfileDto } from "./dto/google-login.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { SetPasswordDto } from "./dto/set-password.dto";
import { UserOnboardingDto } from "./dto/user-onboarding.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { AuthJwtService } from "./jwt.service";

const RESET_TOKEN_PREFIX = "password-reset:";
const RESET_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);
	private readonly resend: Resend;

	constructor(
		private prisma: PrismaService,
		private authJwtService: AuthJwtService,
		private otpService: OtpService,
		private redis: RedisService,
	) {
		this.resend = new Resend(process.env.RESEND_API_KEY);
	}

	private async hashPassword(password: string) {
		return await bcryptjs.hash(password, 10);
	}

	async register(dto: RegisterDto, response: Response) {
		/**
		 * find if user already exists with the email
		 */
		const existingUser = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			},
		});
		if (existingUser) {
			throw new ConflictException({
				error: "User already exists with this email",
				error_code: "USER_ALREADY_EXISTS",
			});
		}

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				password: await this.hashPassword(dto.password),
				firstName: dto.firstName,
				lastName: dto.lastName,
				profile: dto.profile,
			},
		});
		const tokens = await this.authJwtService.generateAuthTokens({ id: user.id });

		response.cookie("access", tokens.access, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		response.cookie("refresh", tokens.refresh, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		try {
			await this.otpService.generateAndSendOtp(dto.email);
		} catch (error) {
			this.logger.error(`Failed to send verification OTP: ${error}`);
		}

		return {
			message: "User registered successfully. Please verify your email.",
			success: true,
			statusCode: 201,
			data: {
				user,
				tokens,
			},
		};
	}

	async login(dto: LoginDto, response: Response) {
		const isValidUser = await this.verifyTurnstileToken(dto.turnstile);

		if (!isValidUser) {
			throw new UnauthorizedException("Turnstile verification failed");
		}

		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			},
		});
		if (!user || !user.password) {
			throw new UnauthorizedException({
				error: "Invalid credentials",
				error_code: "INVALID_CREDENTIALS",
			});
		}

		const isPasswordValid = await bcryptjs.compare(dto.password, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException({
				error: "Invalid credentials",
				error_code: "INVALID_CREDENTIALS",
			});
		}

		const tokens = await this.authJwtService.generateAuthTokens({ id: user.id });

		response.cookie("access", tokens.access, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		response.cookie("refresh", tokens.refresh, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return {
			message: "User logged in successfully",
			success: true,
			statusCode: 200,
			data: {
				user,
				tokens,
			},
		};
	}

	async me(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			omit: {
				password: true,
			},
			include: {
				organizations: {
					select: {
						id: true,
						organizationId: true,
						joinedAt: true,
						organization: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		});

		return {
			message: "User fetched successfully",
			success: true,
			statusCode: 200,
			data: user,
		};
	}

	async googleLogin(profile: GoogleProfileDto, response: Response) {
		let user = await this.prisma.user.findUnique({
			where: { googleId: profile.googleId },
		});

		if (!user && profile.email) {
			user = await this.prisma.user.findUnique({
				where: { email: profile.email },
			});

			if (user) {
				user = await this.prisma.user.update({
					where: { id: user.id },
					data: { googleId: profile.googleId, authProvider: "google" },
				});
			}
		}

		if (!user) {
			user = await this.prisma.user.create({
				data: {
					email: profile.email,
					googleId: profile.googleId,
					firstName: profile.firstName,
					lastName: profile.lastName,
					profile: profile.profile,
					authProvider: "google",
				},
			});
		}

		const tokens = await this.authJwtService.generateAuthTokens({ id: user.id });

		response.cookie("access", tokens.access, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		response.cookie("refresh", tokens.refresh, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return user;
	}

	async verifyTurnstileToken(token: string): Promise<boolean> {
		const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
		if (!secretKey) {
			if (process.env.NODE_ENV === "production") {
				console.error("Cloudflare Turnstile secret key is not set");
				return false;
			}
			console.warn(
				"Cloudflare Turnstile secret key is not set — skipping verification in development",
			);
			return true;
		}

		try {
			const response = await fetch(
				"https://challenges.cloudflare.com/turnstile/v0/siteverify",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						secret: secretKey,
						response: token,
					}),
				},
			);

			const data = await response.json();
			return data.success === true;
		} catch (error) {
			console.error("Error verifying Turnstile token:", error);
			return false;
		}
	}

	async logout(response: Response) {
		response.clearCookie("access");
		response.clearCookie("refresh");
		return {
			message: "User logged out successfully",
			success: true,
			statusCode: 200,
		};
	}

	async forgotPassword(dto: ForgotPasswordDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		// Always return success to prevent email enumeration
		if (!user) {
			return {
				message:
					"If an account exists with this email, a reset link has been sent.",
				data: { email: dto.email },
			};
		}

		const token = randomBytes(32).toString("hex");
		await this.redis.set(
			`${RESET_TOKEN_PREFIX}${token}`,
			user.id,
			RESET_TOKEN_TTL_SECONDS,
		);

		const resetUrl = `${process.env.VITE_APP_URL}/auth/set-password?token=${token}`;
		const from = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

		const { data, error, headers } = await this.resend.emails.send({
			from: "onboarding@resend.dev",
			to: dto.email,
			subject: "Reset your password",
			html: `
					<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
						<h2 style="color: #333;">Reset Your Password</h2>
						<p style="color: #555; font-size: 16px;">
							You requested a password reset. Click the link below to set a new password:
						</p>
						<div style="margin: 16px 0;">
							<a href="${resetUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
								Reset Password
							</a>
						</div>
						<p style="color: #777; font-size: 14px;">
							This link expires in 15 minutes.
							If you did not request this, you can safely ignore this email.
						</p>
					</div>
				`,
		});
		if (data) {
			console.log(`Password reset email sent to ${dto.email}`);
		}
		if (error) {
			this.logger.error(`Failed to send reset email:`, { error });
		}
	}

	async setPassword(dto: SetPasswordDto) {
		const userId = await this.redis.get(`${RESET_TOKEN_PREFIX}${dto.token}`);

		if (!userId) {
			throw new NotFoundException({
				message: "Invalid or expired reset token",
				error_code: "UNAUTHENTICATED",
			});
		}

		await this.redis.del(`${RESET_TOKEN_PREFIX}${dto.token}`);

		const hashedPassword = await bcryptjs.hash(dto.new_password, 10);

		await this.prisma.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		});

		return {
			message: "Password reset successfully",
			data: { success: true },
		};
	}

	async resendVerification(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, isEmailVerified: true },
		});

		if (!user) {
			throw new NotFoundException({
				message: "User not found",
				error_code: "USER_NOT_FOUND",
			});
		}

		if (user.isEmailVerified) {
			return {
				message: "Email is already verified",
				data: { alreadyVerified: true },
			};
		}

		await this.otpService.generateAndSendOtp(
			user.email,
			OtpPurpose.EMAIL_VERIFICATION,
		);

		return {
			message: "Verification code sent successfully",
			data: { alreadyVerified: false },
		};
	}

	async verifyEmail(userId: string, code: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true },
		});

		if (!user) {
			throw new NotFoundException({
				message: "User not found",
				error_code: "USER_NOT_FOUND",
			});
		}

		return this.otpService.verifyOtp(
			user.email,
			code,
			OtpPurpose.EMAIL_VERIFICATION,
		);
	}

	async userOnboarding(userId: string, dto: UserOnboardingDto) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundException({
				message: "User not found",
				error_code: "USER_NOT_FOUND",
			});
		}

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				firstName: dto.firstName,
				lastName: dto.lastName,
				theme: dto.theme,
				referralSource: dto.referralSource,
				isOnboarded: true,
			},
		});

		return {
			message: "User onboarding completed successfully",
			data: { id: userId },
		};
	}
}
