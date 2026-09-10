import { JwtService } from "@nestjs/jwt";
import type { Socket } from "socket.io";

export interface SocketUser {
	id?: string;
	type: "AGENT" | "VISITOR";
}

/**
 * Shared socket classification for the agent namespaces. A valid JWT means
 * an agent; anything else connects as a (limited) visitor. Per-handler
 * AGENT gates still apply - this only stamps identity onto client.data.
 */
export async function resolveSocketUser(
	jwtService: JwtService,
	client: Socket,
): Promise<SocketUser> {
	const token =
		client.handshake.auth?.token ??
		client.handshake.headers?.authorization?.replace("Bearer ", "");
	if (!token) return { type: "VISITOR" };
	try {
		const payload = await jwtService.verifyAsync<{ id: string }>(token);
		return { id: payload.id, type: "AGENT" };
	} catch {
		return { type: "VISITOR" };
	}
}
