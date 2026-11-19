import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,"jwt") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req: Request) => {
                    return req?.cookies?.access;
                },
            ]),
            secretOrKey: process.env.JWT_SECRET ?? "sec",
            algorithms: ["HS256"],
        })
    }

    async validate(payload: { id?: string; scope?: string }) {
        // Admin tokens are scoped and must never authenticate portal users.
        if (!payload?.id || payload.scope === "admin") {
            throw new UnauthorizedException({
                message: "Token is invalid or expired",
                error_code: "UNAUTHENTICATED",
            });
        }

        return {
            id: payload.id,
        };
    }
}
