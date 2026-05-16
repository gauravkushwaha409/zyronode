import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req:Request) => { 
                console.log('Extracting JWT from request cookies:', req.cookies.access)  // IGNORE
                    return req?.cookies?.access
                }
            ]),
            secretOrKey: process.env.JWT_SECRET ?? '',
        })
    }

    async validate(payload: any) {
        console.log('JwtStrategy validate called with payload:', payload)  // IGNORE
        return {
            id: payload.id,
            email: payload.email,
            name: payload.name,
        };
    }

}