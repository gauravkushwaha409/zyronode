import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {
	Strategy,
	type StrategyOptions,
	VerifyCallback,
} from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
	constructor() {
		const rawCallback = process.env.GOOGLE_CALLBACK_URL ?? "";
		const callbackURL =
			rawCallback.replace(
				/\$\{([^}]+)\}|\$([A-Z0-9_]+)/g,
				(_, b, c) => process.env[b ?? c] ?? "",
			) ||
			`http://localhost:${process.env.SERVER_PORT ?? "8000"}/api/v1/auth/google/callback`;
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL,
			scope: ["email", "profile"],
		} as StrategyOptions);
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: {
			id: string;
			emails?: { value: string; verified?: boolean }[];
			name?: { givenName?: string; familyName?: string };
			photos?: { value: string }[];
		},
		_done: VerifyCallback,
	) {
		const { id, emails, name, photos } = profile;

		return {
			googleId: id,
			email: emails?.[0]?.value,
			emailVerified: emails?.[0]?.verified === true,
			firstName: name?.givenName,
			lastName: name?.familyName,
			profile: photos?.[0]?.value,
		};
	}
}
