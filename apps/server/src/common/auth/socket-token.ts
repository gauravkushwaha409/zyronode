import type { Socket } from "socket.io";

/**
 * Extracts a JWT from a socket handshake, mirroring JwtStrategy (Bearer
 * header OR `access` cookie). The agent dashboard authenticates over the
 * httpOnly cookie - localStorage carries no token - so sockets must read
 * the cookie too (withCredentials sends it on the handshake).
 */
export function tokenFromHandshake(client: Socket): string | null {
	const auth = client.handshake.auth?.token;
	if (typeof auth === "string" && auth.length > 0) return auth;
	const header = client.handshake.headers?.authorization?.replace("Bearer ", "");
	if (header && header.length > 0 && header !== "Bearer") return header;
	const cookie = client.handshake.headers?.cookie;
	if (cookie) {
		const match = /(?:^|;\s*)access=([^;]+)/.exec(cookie);
		const value = match?.[1]?.trim();
		if (value) {
			try {
				return decodeURIComponent(value);
			} catch {
				return value;
			}
		}
	}
	return null;
}
