// apps/server/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcryptjs from "bcryptjs";
import type { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { GoogleProfileDto } from "./dto/google-login.dto";
import { AuthJwtService } from "./jwt.service";

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private authJwtService: AuthJwtService,
	) {}

	private async hashPassword(password: string) {
		return await bcryptjs.hash(password, 10);
	}

	async getTokens(user: {
		id: string;
		email: string;
		firstName: string | null;
		lastName: string | null;
	}) {
		const payload = {
			id: user.id,
			email: user.email,
			name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
		};

		return this.authJwtService.generateAuthTokens(payload);
	}

	async register(dto: RegisterDto, response: Response) {
		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				password: await this.hashPassword(dto.password),
				firstName: dto.firstName,
				lastName: dto.lastName,
				profile: dto.profile,
			},
		});
		const tokens = await this.getTokens(user);

		response.cookie("access", tokens.access, {
			httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			sameSite: "none",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		response.cookie("refresh", tokens.refresh, {
			httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			sameSite: "none",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return {
			message: "User registered successfully",
			success: true,
			statusCode: 201,
			data: {
				user,
				tokens,
			},
		};
	}

	async login(dto: LoginDto, response: Response) {
		const isValidUser = this.verifyTurnstileToken(dto.turnstile);
		if (!isValidUser) {
			throw new UnauthorizedException("Turnstile verification failed");
		}

		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			},
		});
		if (!user) {
			throw new UnauthorizedException("No user found!");
		}
		if (!user.password) {
			throw new UnauthorizedException("Invalid credentials");
		}
		const isPasswordValid = await bcryptjs.compare(dto.password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const tokens = await this.getTokens(user);

		response.cookie("access", tokens.access, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		response.cookie("refresh", tokens.refresh, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
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

		const tokens = await this.getTokens(user);

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
		const secretKey = process.env.CLOUDEFLARE_TURNSTILE_SECRET_KEY;
		if (!secretKey) {
			console.error("Cloudflare Turnstile secret key is not set");
			return false;
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
}
