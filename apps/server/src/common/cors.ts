/**
 * Shared Socket.io CORS origins for every gateway. Ports come from the
 * environment (see .env.example); keep this as the single copy so the
 * namespaces cannot drift apart.
 */
export function getCorsOrigins(): string[] {
	const appPort = process.env.APP_PORT ?? "3000";
	const chatWidgetPort = process.env.CHAT_WIDGET_PORT ?? "4000";
	const origins = new Set<string>([
		`http://localhost:${appPort}`,
		`http://localhost:${chatWidgetPort}`,
	]);
	const viteAppUrl = process.env.VITE_APP_URL?.replace(
		/\$\{([^}]+)\}|\$([A-Z0-9_]+)/g,
		(_, b, c) => process.env[b ?? c] ?? "",
	);
	if (viteAppUrl) {
		try {
			origins.add(new URL(viteAppUrl).origin);
		} catch {}
	}
	if (process.env.CORS_ORIGINS) {
		for (const o of process.env.CORS_ORIGINS.split(",")) {
			const t = o.trim();
			if (t) origins.add(t);
		}
	}
	return [...origins];
}
