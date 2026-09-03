// apps/backend/src/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { EmailVerifiedGuard } from "../common/gaurds/email-verified.guard";
import { OnboardingGuard } from "../common/gaurds/onboarding.guard";
import { OtpModule } from "../otp/otp.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthJwtService } from "./jwt.service";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: "jwt", session: false }),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
		OtpModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		AuthJwtService,
		JwtStrategy,
		GoogleStrategy,
		OnboardingGuard,
		EmailVerifiedGuard,
	],
	exports: [OnboardingGuard, EmailVerifiedGuard,PassportModule],
})
export class AuthModule {}
