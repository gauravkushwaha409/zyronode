export class GoogleProfileDto {
	googleId!: string;
	email!: string;
	/** Google's `email_verified` claim. */
	emailVerified!: boolean;
	firstName?: string;
	lastName?: string;
	profile?: string;
}
