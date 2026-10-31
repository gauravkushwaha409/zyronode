/* eslint-disable no-undef */
// Firebase Cloud Messaging service worker for the agent dashboard.
// The web config is passed as query params by buildServiceWorkerUrl() because
// this file is served verbatim from public/ and cannot read Vite env vars.
importScripts(
	"https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js",
);
importScripts(
	"https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js",
);

const params = new URL(self.location.href).searchParams;

firebase.initializeApp({
	apiKey: params.get("apiKey"),
	authDomain: params.get("authDomain"),
	projectId: params.get("projectId"),
	storageBucket: params.get("storageBucket"),
	messagingSenderId: params.get("messagingSenderId"),
	appId: params.get("appId"),
});

const messaging = firebase.messaging();

// Server sends data-only messages, so render the notification here while the
// dashboard tab is in the background (foreground is handled by the app).
messaging.onBackgroundMessage((payload) => {
	const data = payload.data || {};
	self.registration.showNotification(data.title || "Zyronode", {
		body: data.body || "",
		icon: "/favicon.svg",
		badge: "/favicon.svg",
		// One OS notification per message. Calls keep a stable tag so repeated
		// ring pushes for the same call replace each other.
		tag: data.messageId || data.callId || undefined,
		data: { link: data.link || "/" },
	});
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const link = event.notification.data?.link || "/";

	event.waitUntil(
		self.clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((clients) => {
				for (const client of clients) {
					if ("focus" in client) {
						client.focus();
						if (client.navigate) return client.navigate(link);
						return undefined;
					}
				}
				if (self.clients.openWindow) return self.clients.openWindow(link);
				return undefined;
			}),
	);
});
