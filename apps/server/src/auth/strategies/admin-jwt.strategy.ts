import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AUTH_COOKIES } from "../../common/auth/auth-cookies";

/**
 * Admin-only JWT strategy. It reads the dedicated `admin_access` cookie (or
 * an Authorization bearer token) and rejects normal portal tokens.
 */
@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, "admin-jwt") {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				ExtractJwt.fromAuthHeaderAsBearerToken(),
				(req: Request) => req?.cookies?.[AUTH_COOKIES.ADMIN_ACCESS],
			]),
			secretOrKey: process.env.JWT_SECRET ?? "sec",
			algorithms: ["HS256"],
		});
	}

	async validate(payload: { id?: string; scope?: string }) {
		if (!payload?.id || payload.scope !== "admin") {
			throw new UnauthorizedException({
				message: "Admin token is invalid or expired",
				error_code: "UNAUTHENTICATED",
			});
		}

		return { id: payload.id, scope: "admin" as const };
	}
}
