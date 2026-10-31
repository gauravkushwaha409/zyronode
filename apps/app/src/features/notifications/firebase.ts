import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

export interface FirebaseWebConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
}

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as
	| string
	| undefined;

export function getFirebaseWebConfig(): FirebaseWebConfig | null {
	const config = {
		apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
		authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
		projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
		storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as
			| string
			| undefined,
		messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as
			| string
			| undefined,
		appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
	};

	if (!config.apiKey || !config.projectId || !config.messagingSenderId) {
		return null;
	}
	if (!config.appId) return null;

	return config as FirebaseWebConfig;
}

export function isPushConfigured(): boolean {
	return (
		getFirebaseWebConfig() !== null &&
		Boolean(VAPID_KEY) &&
		typeof window !== "undefined" &&
		"Notification" in window &&
		"serviceWorker" in navigator
	);
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
	const config = getFirebaseWebConfig();
	if (!config || !VAPID_KEY) return null;
	if (!(await isSupported())) return null;

	const app: FirebaseApp = getApps()[0] ?? initializeApp(config, "zyronode-app");
	return getMessaging(app);
}

/**
 * The service worker is static (Vite copies `public/` verbatim) but Firebase
 * still needs its web config. Public config is safe to expose, so we pass it
 * as query params on the registration URL and parse it inside the worker.
 */
export function buildServiceWorkerUrl(config: FirebaseWebConfig): string {
	const params = new URLSearchParams({
		apiKey: config.apiKey,
		authDomain: config.authDomain,
		projectId: config.projectId,
		storageBucket: config.storageBucket,
		messagingSenderId: config.messagingSenderId,
		appId: config.appId,
	});
	return `/firebase-messaging-sw.js?${params.toString()}`;
}
