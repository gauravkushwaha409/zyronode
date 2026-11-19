import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { EmailService } from "../email/email.service";
import { PrismaService } from "../prisma/prisma.service";
import { RedisKey } from "../redis/redis.keys";
import { RedisService } from "../redis/redis.service";
import { OtpPurpose } from "./types/otp-purpose.type";

const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
const OTP_LENGTH = 6;

@Injectable()
export class OtpService {
	private readonly logger = new Logger(OtpService.name);

	constructor(
		private prisma: PrismaService,
		private redis: RedisService,
		private email: EmailService,
	) {}

	private generateCode(): string {
		const max = 10 ** OTP_LENGTH;
		return Math.floor(Math.random() * max)
			.toString()
			.padStart(OTP_LENGTH, "0");
	}

	async generateOtp(
		email: string,
		purpose: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION,
	): Promise<{ message: string }> {
		const code = this.generateCode();

		await this.redis.set(RedisKey.otp(purpose, email), code, OTP_TTL_SECONDS);
		await this.email.sendOtp(email, code);

		this.logger.log(`OTP [${purpose}] sent to ${email}`);
		return { message: "Verification code sent successfully" };
	}

	async verifyOtp(
		email: string,
		code: string,
		purpose: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION,
	): Promise<{ message: string }> {
		const stored = await this.redis.get(RedisKey.otp(purpose, email));

		if (!stored) {
			throw new BadRequestException({
				message: "Verification code has expired or was not sent",
				error_code: "OTP_EXPIRED",
			});
		}

		if (stored !== code) {
			throw new BadRequestException({
				message: "Invalid verification code",
				error_code: "INVALID_OTP",
			});
		}

		await this.redis.del(RedisKey.otp(purpose, email));

		if (purpose === OtpPurpose.EMAIL_VERIFICATION) {
			const verifiedUser = await this.prisma.user.update({
				where: { email },
				data: { isEmailVerified: true },
			});
			await this.redis.del(RedisKey.userProfile(verifiedUser.id));
		}

		this.logger.log(`OTP [${purpose}] verified for ${email}`);
		return { message: "Code verified successfully" };
	}
}
