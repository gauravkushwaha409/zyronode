import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import * as bcryptjs from "bcryptjs";
import type { Response } from "express";
import {
	clearAdminAuthCookies,
	setAdminAuthCookies,
} from "../common/auth/auth-cookies";
import { PrismaService } from "../prisma/prisma.service";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { AuthJwtService } from "./jwt.service";

const ADMIN_USER_SELECT = {
	id: true,
	email: true,
	firstName: true,
	lastName: true,
	profile: true,
	platformRole: true,
} as const;

@Injectable()
export class AdminAuthService {
	constructor(
		private prisma: PrismaService,
		private authJwtService: AuthJwtService,
	) {}

	async login(dto: AdminLoginDto, response: Response) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		// Same error for unknown users, wrong passwords, and non-admins so the
		// endpoint cannot be used to enumerate platform administrators.
		if (!user?.password || user.platformRole === "NONE") {
			throw new UnauthorizedException({
				error: "Invalid credentials",
				error_code: "INVALID_CREDENTIALS",
			});
		}

		const isPasswordValid = await bcryptjs.compare(
			dto.password,
			user.password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedException({
				error: "Invalid credentials",
				error_code: "INVALID_CREDENTIALS",
			});
		}

		const tokens = await this.authJwtService.generateAdminTokens({
			id: user.id,
		});
		setAdminAuthCookies(response, tokens);

		return {
			message: "Admin logged in successfully",
			data: {
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					profile: user.profile,
					platformRole: user.platformRole,
				},
			},
		};
	}

	async me(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: ADMIN_USER_SELECT,
		});

		if (!user || user.platformRole === "NONE") {
			throw new ForbiddenException({
				message: "Platform admin access is required",
				error_code: "FORBIDDEN",
			});
		}

		return {
			message: "Admin fetched successfully",
			data: { user },
		};
	}

	async logout(response: Response) {
		clearAdminAuthCookies(response);
		return {
			message: "Admin logged out successfully",
			data: null,
		};
	}
}
