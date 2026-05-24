import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req:Request) => { 
                    return req?.cookies?.access
                }
            ]),
            secretOrKey: process.env['JWT_SECRET'] ?? "sec",
        })
    }

    async validate(payload: any) {
        return {
            id: payload.id,
            email: payload.email,
            name: payload.name,
        };
    }

}