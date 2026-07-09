// apps/backend/src/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthJwtService } from "./jwt.service";
import { OnboardingGuard } from "../common/gaurds/onboarding.guard";
import { EmailVerifiedGuard } from "../common/gaurds/email-verified.guard";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, AuthJwtService, JwtStrategy, GoogleStrategy, OnboardingGuard, EmailVerifiedGuard],
	exports: [OnboardingGuard, EmailVerifiedGuard],
})
export class AuthModule {}
