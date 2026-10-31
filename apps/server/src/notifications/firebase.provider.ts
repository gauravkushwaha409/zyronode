import { Logger, type Provider } from "@nestjs/common";
import { type App, cert, getApps, initializeApp } from "firebase-admin/app";

export const FIREBASE_APP = Symbol("FIREBASE_APP");

const FIREBASE_APP_NAME = "zyronode-fcm";

/**
 * Docker compose interpolates `$VAR` in env_file, so .env stores `$$` to mean
 * a literal `$`. Private keys are multi-line and usually written with `\n`
 * escapes, so normalize both before handing the credential to Firebase.
 */
function normalizeSecret(value: string | undefined): string | undefined {
	return value?.replace(/\$\$/g, "$").replace(/\\n/g, "\n");
}

export const firebaseAppProvider: Provider = {
	provide: FIREBASE_APP,
	useFactory: (): App | null => {
		const logger = new Logger("Firebase");
		const projectId = process.env.FIREBASE_PROJECT_ID;
		const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
		const privateKey = normalizeSecret(process.env.FIREBASE_PRIVATE_KEY);

		if (process.env.FCM_ENABLED === "false") {
			logger.log("FCM disabled via FCM_ENABLED=false");
			return null;
		}

		if (!projectId || !clientEmail || !privateKey) {
			logger.warn(
				"FCM disabled: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set",
			);
			return null;
		}

		const existing = getApps().find((app) => app.name === FIREBASE_APP_NAME);
		if (existing) return existing;

		logger.log(`Initializing Firebase app for project ${projectId}`);
		return initializeApp(
			{
				credential: cert({ projectId, clientEmail, privateKey }),
			},
			FIREBASE_APP_NAME,
		);
	},
};
