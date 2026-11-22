export interface EmailContent {
	subject: string;
	html: string;
	text: string;
}

export function buildOtpEmail(code: string): EmailContent {
	return {
		subject: "Your verification code",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
				<h2 style="color: #333;">Verify your email</h2>
				<p style="color: #555; font-size: 16px;">Your verification code is:</p>
				<div style="background: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
					<span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111;">${code}</span>
				</div>
				<p style="color: #777; font-size: 14px;">
					This code expires in 5 minutes.
					If you did not request this, you can safely ignore this email.
				</p>
			</div>
		`,
		text: `Your verification code is ${code}. This code expires in 5 minutes.`,
	};
}

export function buildPasswordResetEmail(resetUrl: string): EmailContent {
	return {
		subject: "Reset your password",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
				<h2 style="color: #333;">Reset Your Password</h2>
				<p style="color: #555; font-size: 16px;">
					You requested a password reset. Click the link below to set a new password:
				</p>
				<div style="margin: 16px 0;">
					<a href="${resetUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
						Reset Password
					</a>
				</div>
				<p style="color: #777; font-size: 14px;">
					This link expires in 15 minutes.
					If you did not request this, you can safely ignore this email.
				</p>
			</div>
		`,
		text: `Reset your password using this link: ${resetUrl}. This link expires in 15 minutes.`,
	};
}
