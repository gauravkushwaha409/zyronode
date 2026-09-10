import { Logger } from "@nestjs/common";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { getCorsOrigins } from "../common/cors";
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

/**
 * WebSocket gateway for handling visitor presence.
 *
 */

@WebSocketGateway({
	namespace: "/visitor",
	cors: {
		origin: getCorsOrigins(),
		credentials: true,
	},
})
export class VisitorGateway
	implements OnGatewayDisconnect, OnGatewayConnection
{
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

		await this.visitorService.recordPresenceHeartbeat(
			data.organizationId,
			data.visitorId,
			{ currentPage: data.currentPage, activeDuration: data.activeDuration },
		);

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
		// handleDisconnect fires next on socket close - it must not republish.
		client.data.left = true;

		return { event: "visitor:left:ack", data: { visitorId: data.visitorId } };
	}

	/**
	 * Tab crash / network drop - no "visitor:left" ever arrives. Best-effort
	 * cleanup of the Redis entry; even if this never fires, the read-path
	 * cutoff (ONLINE_WINDOW_MS) still ages the stale entry out.
	 */
	async handleDisconnect(client: Socket) {
		const { visitorId, organizationId, left } = client.data ?? {};
		if (!visitorId || !organizationId) return;
		// "visitor:left" already published the offline event - socket close
		// must not repeat it.
		if (left) return;
		try {
			await this.visitorService.recordPresenceOffline(organizationId, visitorId);
		} catch (err) {
			this.logger.warn(
				`Presence cleanup failed for visitor ${visitorId}: ${(err as Error).message}`,
			);
		}
	}

	handleConnection(client: Socket) {
		this.logger.log(`Visitor socket connected: ${client.id}`);
	}
}
