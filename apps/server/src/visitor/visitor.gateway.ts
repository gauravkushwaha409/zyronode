import { Logger } from "@nestjs/common";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { VisitorService } from "./visitor.service";

interface VisitorPresencePayload {
	organizationId: string;
	visitorId: string;
	currentPage?: string;
	activeDuration?: number;
}

/**
 * Visitor presence, backed by Redis (see VisitorService.recordPresenceHeartbeat).
 *
 * organizationId/visitorId arrive on the client payload, so every handler
 * verifies the pair against the DB before joining a room or touching Redis -
 * otherwise a client could claim any org/visitor id and poison another
 * tenant's presence set (see CLAUDE.md contract #2, multi-tenancy IDOR).
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
export class VisitorGateway implements OnGatewayDisconnect {
	@WebSocketServer()
	server!: Server;

	private readonly logger = new Logger(VisitorGateway.name);

	constructor(private readonly visitorService: VisitorService) {}

	@SubscribeMessage("visitor:presence")
	async handlePresence(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: VisitorPresencePayload,
	) {
		if (!data?.organizationId || !data?.visitorId) {
			return {
				event: "error",
				data: { message: "organizationId and visitorId are required" },
			};
		}

		const isMember = await this.visitorService.verifyVisitorMembership(
			data.visitorId,
			data.organizationId,
		);
		if (!isMember) {
			this.logger.warn(
				`Presence rejected: visitor ${data.visitorId} not in org ${data.organizationId}`,
			);
			return { event: "error", data: { message: "Unauthorized" } };
		}

		// cache the verified pair so handleDisconnect can clean up without
		// trusting an unverified payload at disconnect time
		client.data.visitorId = data.visitorId;
		client.data.organizationId = data.organizationId;
		client.join(`org:${data.organizationId}`);

		await this.visitorService.recordPresenceHeartbeat(
			data.organizationId,
			data.visitorId,
			{ currentPage: data.currentPage, activeDuration: data.activeDuration },
		);

		client.to(`org:${data.organizationId}`).emit("visitor:presence", {
			visitorId: data.visitorId,
			currentPage: data.currentPage,
			activeDuration: data.activeDuration,
			isOnline: true,
			at: new Date().toISOString(),
		});

		return { event: "visitor:presence:ack", data: { visitorId: data.visitorId } };
	}

	/** Visitor closed the tab / navigated away deliberately. */
	@SubscribeMessage("visitor:left")
	async handleLeft(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { organizationId: string; visitorId: string },
	) {
		if (!data?.organizationId || !data?.visitorId) {
			return {
				event: "error",
				data: { message: "organizationId and visitorId are required" },
			};
		}

		const isMember = await this.visitorService.verifyVisitorMembership(
			data.visitorId,
			data.organizationId,
		);
		if (!isMember) {
			return { event: "error", data: { message: "Unauthorized" } };
		}

		await this.visitorService.recordPresenceOffline(
			data.organizationId,
			data.visitorId,
		);

		client.to(`org:${data.organizationId}`).emit("visitor:presence", {
			visitorId: data.visitorId,
			isOnline: false,
			at: new Date().toISOString(),
		});

		return { event: "visitor:left:ack", data: { visitorId: data.visitorId } };
	}

	/**
	 * Tab crash / network drop - no "visitor:left" ever arrives. Best-effort
	 * cleanup of the Redis entry; even if this never fires, the read-path
	 * cutoff (ONLINE_WINDOW_MS) still ages the stale entry out.
	 */
	async handleDisconnect(client: Socket) {
		const { visitorId, organizationId } = client.data ?? {};
		if (!visitorId || !organizationId) return;
		await this.visitorService.recordPresenceOffline(organizationId, visitorId);
	}
}
