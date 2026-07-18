import {
	BadRequestException,
	Injectable,
	Logger,
} from "@nestjs/common";
import { Resend } from "resend";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { OtpPurpose } from "./types/otp-purpose.type";

const OTP_KEY_PREFIX = "otp:";
const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
const OTP_LENGTH = 6;

@Injectable()
export class OtpService {
	private readonly resend: Resend;
	private readonly logger = new Logger(OtpService.name);

	constructor(
		private prisma: PrismaService,
		private redis: RedisService,
	) {
		this.resend = new Resend(process.env.RESEND_API_KEY);
	}

	private generateCode(): string {
		const max = 10 ** OTP_LENGTH;
		return Math.floor(Math.random() * max)
			.toString()
			.padStart(OTP_LENGTH, "0");
	}

	private redisKey(email: string, purpose: OtpPurpose): string {
		return `${OTP_KEY_PREFIX}${purpose}:${email}`;
	}

	private async sendEmail(to: string, code: string): Promise<void> {
		const from = process.env.RESEND_FROM_EMAIL || "noreply@example.com";
		try {


			await this.resend.emails.send({
				from,
				to,
				subject: "Your verification code",
				html: `
				<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
					<h2 style="color: #333;">Verify your email</h2>
					<p style="color: #555; font-size: 16px;">
						Your verification code is:
					</p>
					<div style="background: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
						<span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111;">
							${code}
						</span>
					</div>
					<p style="color: #777; font-size: 14px;">
						This code expires in 5 minutes.
						If you did not request this, you can safely ignore this email.
					</p>
				</div>
			`,
			});

			this.logger.log(`OTP email sent to ${to}`);
		} catch (error) {
			this.logger.error(`Failed to send OTP email:`, { error });
		}
	}

	async generateAndSendOtp(
		email: string,
		purpose: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION,
	): Promise<{ message: string }> {
		const code = this.generateCode();

		await this.redis.set(this.redisKey(email, purpose), code, OTP_TTL_SECONDS);
		console.log(`Generated OTP [${purpose}] for ${email}: ${code}`);

		await this.sendEmail(email, code);

		this.logger.log(`OTP [${purpose}] sent to ${email}`);
		return { message: "Verification code sent successfully" };
	}

	async verifyOtp(
		email: string,
		code: string,
		purpose: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION,
	): Promise<{ message: string }> {
		const stored = await this.redis.get(this.redisKey(email, purpose));

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

		await this.redis.del(this.redisKey(email, purpose));

		if (purpose === OtpPurpose.EMAIL_VERIFICATION) {
			await this.prisma.user.update({
				where: { email },
				data: { isEmailVerified: true },
			});
		}

		this.logger.log(`OTP [${purpose}] verified for ${email}`);
		return { message: "Code verified successfully" };
	}
}
