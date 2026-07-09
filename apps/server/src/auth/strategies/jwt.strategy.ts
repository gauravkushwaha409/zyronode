import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,"jwt") {
    constructor() {

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req:Request) => { 
                    return req?.cookies?.access
                }
            ]),
            secretOrKey: process.env['JWT_SECRET'] ?? "sec",
            algorithms: ["HS256"],
            
        })
    }

    async validate(payload) {
        console.log("JWT Strategy - validate called with payload:----------> ", payload);
        return {
            id: payload.id,
        };
    }




}