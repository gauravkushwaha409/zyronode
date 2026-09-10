import { Injectable } from "@nestjs/common";
import { SseService } from "../sse/sse.service";

export interface VisitorPresencePayload {
	visitorId: string;
	externalId: string | null;
}

/**
 * Single owner for every server -> client visitor event.
 *
 * Transport rule: SSE pushes data down, WebSocket only carries client ->
 * server messages (presence heartbeats, explicit leave). Callers decide
 * *when* a transition happened; this publisher fixes event names and
 * payload shapes so they cannot drift per call site.
 */
@Injectable()
export class VisitorEventsPublisher {
	constructor(private readonly sse: SseService) {}

	private keys(organizationId: string): string[] {
		return [`org:${organizationId}`];
	}

	connected(organizationId: string, data: VisitorPresencePayload): void {
		void this.sse.publish(this.keys(organizationId), "visitor.connected", {
			...data,
			isOnline: true,
		});
	}

	disconnected(organizationId: string, data: VisitorPresencePayload): void {
		void this.sse.publish(this.keys(organizationId), "visitor.disconnected", {
			...data,
			isOnline: false,
		});
	}

	created(organizationId: string, visitor: unknown): void {
		void this.sse.publish(this.keys(organizationId), "visitor.created", {
			visitor,
		});
	}

	updated(organizationId: string, visitor: unknown): void {
		void this.sse.publish(this.keys(organizationId), "visitor.updated", {
			visitor,
		});
	}

	assigned(organizationId: string, visitor: unknown): void {
		void this.sse.publish(this.keys(organizationId), "visitor.assigned", {
			visitor,
		});
	}

	noteCreated(
		organizationId: string,
		data: { visitorId: string; note: unknown },
	): void {
		void this.sse.publish(
			this.keys(organizationId),
			"visitor.note.created",
			data,
		);
	}
}
