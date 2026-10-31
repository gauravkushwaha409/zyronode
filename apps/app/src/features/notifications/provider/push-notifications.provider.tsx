import {
	useForegroundPushMessages,
	usePushNotifications,
} from "../hooks/use-push-notifications";

/**
 * Always-mounted inside the authenticated tree: keeps the browser token
 * registered and renders foreground notifications. It renders nothing.
 */
export function PushNotificationsProvider() {
	usePushNotifications();
	useForegroundPushMessages();
	return null;
}
