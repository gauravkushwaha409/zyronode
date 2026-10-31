import { getToken, onMessage } from "firebase/messaging";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	buildServiceWorkerUrl,
	getFirebaseMessaging,
	getFirebaseWebConfig,
	isPushConfigured,
	VAPID_KEY,
} from "../firebase";
import { notificationsApiService } from "../services/notifications.services";

const TOKEN_STORAGE_KEY = "zyronode:fcm-token";

export type PushPermission = NotificationPermission | "unsupported";

/**
 * Registers this browser for FCM Web Push. Safe to mount more than once:
 * registration is idempotent (the server upserts by token).
 */
export function usePushNotifications() {
	const supported = isPushConfigured();
	const [permission, setPermission] = useState<PushPermission>(() => {
		if (!supported || typeof Notification === "undefined") return "unsupported";
		return Notification.permission;
	});
	const [isRegistering, setIsRegistering] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const tokenRef = useRef<string | null>(
		typeof localStorage === "undefined"
			? null
			: localStorage.getItem(TOKEN_STORAGE_KEY),
	);

	const register = useCallback(async () => {
		const messaging = await getFirebaseMessaging();
		const config = getFirebaseWebConfig();
		if (!messaging || !config || !VAPID_KEY) {
			throw new Error("Push notifications are not configured.");
		}

		const registration = await navigator.serviceWorker.register(
			buildServiceWorkerUrl(config),
		);
		const token = await getToken(messaging, {
			vapidKey: VAPID_KEY,
			serviceWorkerRegistration: registration,
		});
		if (!token) throw new Error("Could not obtain a push token.");

		await notificationsApiService.registerToken({ token });
		tokenRef.current = token;
		localStorage.setItem(TOKEN_STORAGE_KEY, token);
		return token;
	}, []);

	const enable = useCallback(async () => {
		if (!supported) {
			setError("Push notifications are not supported in this browser.");
			return;
		}
		setIsRegistering(true);
		setError(null);
		try {
			const result = await Notification.requestPermission();
			setPermission(result);
			if (result !== "granted") return;
			await register();
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setIsRegistering(false);
		}
	}, [register, supported]);

	const disable = useCallback(async () => {
		const token = tokenRef.current;
		if (!token) return;
		try {
			await notificationsApiService.removeToken(token);
		} catch {
			// Best effort: a stale token is pruned server-side when FCM rejects it.
		}
		tokenRef.current = null;
		localStorage.removeItem(TOKEN_STORAGE_KEY);
	}, []);

	// Push is required for every signed-in user: ask for permission on load
	// (once), then register this browser whenever permission is granted.
	useEffect(() => {
		if (!supported || typeof Notification === "undefined") return;

		let cancelled = false;
		const run = async () => {
			try {
				let current = Notification.permission;
				if (current === "default") {
					current = await Notification.requestPermission();
					if (cancelled) return;
					setPermission(current);
				}
				if (current === "granted") await register();
			} catch (err) {
				if (!cancelled) setError((err as Error).message);
			}
		};

		void run();
		return () => {
			cancelled = true;
		};
	}, [register, supported]);

	return {
		supported,
		permission,
		isRegistering,
		error,
		enable,
		disable,
	};
}

/**
 * Foreground FCM handler. The server sends data-only messages, so this shows
 * the OS notification only while the dashboard is hidden; when it is visible
 * the in-app realtime layer already updated the UI.
 */
export function useForegroundPushMessages() {
	useEffect(() => {
		if (!isPushConfigured()) return;

		let disposed = false;
		let unsubscribe: (() => void) | undefined;

		void (async () => {
			const messaging = await getFirebaseMessaging();
			if (!messaging || disposed) return;
			unsubscribe = onMessage(messaging, (payload) => {
				const data = payload.data ?? {};
				const title = data.title ?? "Zyronode";
				const body = data.body;
				if (document.visibilityState === "visible") return;

				const notification = new Notification(title, {
					body,
					icon: "/favicon.svg",
					data,
				});
				notification.onclick = () => {
					window.focus();
					if (data.link) window.location.assign(data.link);
					notification.close();
				};
			});
		})();

		return () => {
			disposed = true;
			unsubscribe?.();
		};
	}, []);
}
