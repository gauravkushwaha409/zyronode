import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type StrategyOptions, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
	constructor() {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
			scope: ["email", "profile"],
		} as StrategyOptions);
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: { id: string; emails?: { value: string }[]; name?: { givenName?: string; familyName?: string }; photos?: { value: string }[] },
		_done: VerifyCallback,
	) {
		const { id, emails, name, photos } = profile;

		return {
			googleId: id,
			email: emails?.[0]?.value,
			firstName: name?.givenName,
			lastName: name?.familyName,
			profile: photos?.[0]?.value,
		};
	}
}
