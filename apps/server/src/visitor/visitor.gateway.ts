import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

interface VisitorPresencePayload {
	organizationId: string;
	visitorId: string;
	currentPage?: string;
	activeDuration?: number;
	isOnline?: boolean;
}

/**
 * Ephemeral visitor presence.
 *
 * These signals fire far too often to write to Postgres on every tick, so
 * they are taken from the client and rebroadcast to the org room without
 * being persisted. Anything that IS persisted (visitor row edits, notes,
 * assignment) goes out over SSE from VisitorService instead.
 */
function getCorsOrigins(): string[] {
	const appPort = process.env.APP_PORT ?? "3000";
	const chatWidgetPort = process.env.CHAT_WIDGET_PORT ?? "4000";
	const origins = new Set<string>([
		`http://localhost:${appPort}`,
		`http://localhost:${chatWidgetPort}`,
		"http://localhost:4001",
	]);
	const viteAppUrl = process.env.VITE_APP_URL?.replace(/\$\{([^}]+)\}|\$([A-Z0-9_]+)/g, (_, b, c) => process.env[b ?? c] ?? "");
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

@WebSocketGateway({
	cors: {
		origin: getCorsOrigins(),
		credentials: true,
	},
})
export class VisitorGateway {
	@WebSocketServer()
	server!: Server;

	@SubscribeMessage("visitor:presence")
	handlePresence(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: VisitorPresencePayload,
	) {
		if (!data?.organizationId || !data?.visitorId) {
			return {
				event: "error",
				data: { message: "organizationId and visitorId are required" },
			};
		}

		// broadcast to everyone in the org room except the sender
		client.to(`org:${data.organizationId}`).emit("visitor:presence", {
			visitorId: data.visitorId,
			currentPage: data.currentPage,
			activeDuration: data.activeDuration,
			isOnline: data.isOnline ?? true,
			at: new Date().toISOString(),
		});

		return { event: "visitor:presence:ack", data: { visitorId: data.visitorId } };
	}

	/**
	 * Visitor closed the tab / went idle. Still ephemeral - the durable
	 * lastSeenAt is written by the widget's periodic heartbeat, not here.
	 */
	@SubscribeMessage("visitor:left")
	handleLeft(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { organizationId: string; visitorId: string },
	) {
		if (!data?.organizationId || !data?.visitorId) {
			return {
				event: "error",
				data: { message: "organizationId and visitorId are required" },
			};
		}

		client.to(`org:${data.organizationId}`).emit("visitor:presence", {
			visitorId: data.visitorId,
			isOnline: false,
			at: new Date().toISOString(),
		});

		return { event: "visitor:left:ack", data: { visitorId: data.visitorId } };
	}
}
