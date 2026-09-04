export function getSocketUrl(): string {
	if (typeof window === "undefined") return "";
	const isProxy =
		typeof __PROXY_ENABLED__ !== "undefined" && __PROXY_ENABLED__;
	if (isProxy) return window.location.origin;
	return __SERVER_URL__;
}
