import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { Injectable, Logger } from "@nestjs/common";
import {
	buildOtpEmail,
	buildPasswordResetEmail,
	type EmailContent,
} from "./email.templates";

interface SendEmailInput extends EmailContent {
	to: string;
}

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);
	private readonly client: SESv2Client;
	private readonly fromEmail: string | undefined;
	private readonly fromName: string | undefined;

	constructor() {
		this.client = new SESv2Client({
			region: process.env.AWS_REGION || "us-east-1",
		});
		this.fromEmail = process.env.SES_FROM_EMAIL;
		this.fromName = process.env.SES_FROM_NAME;

		if (!this.fromEmail) {
			this.logger.warn("SES_FROM_EMAIL is not set; email sending will fail");
		}
	}

	async sendOtp(to: string, code: string): Promise<void> {
		await this.send({ to, ...buildOtpEmail(code) });
	}

	async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
		await this.send({ to, ...buildPasswordResetEmail(resetUrl) });
	}

	private async send({
		to,
		subject,
		html,
		text,
	}: SendEmailInput): Promise<void> {
		if (!this.fromEmail) {
			throw new Error("SES_FROM_EMAIL is not set");
		}

		const from = this.fromName
			? `"${this.fromName}" <${this.fromEmail}>`
			: this.fromEmail;

		await this.client.send(
			new SendEmailCommand({
				FromEmailAddress: from,
				Destination: { ToAddresses: [to] },
				Content: {
					Simple: {
						Subject: { Data: subject, Charset: "UTF-8" },
						Body: {
							Html: { Data: html, Charset: "UTF-8" },
							Text: { Data: text, Charset: "UTF-8" },
						},
					},
				},
			}),
		);

		this.logger.log(`Email sent to ${to}`);
	}
}
