import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from "@nestjs/common";
import { RedisChannel } from "../redis/redis.keys";
import { RedisService } from "../redis/redis.service";

export interface SseClient {
	id: string;
	keys: Set<string>;
	/** When set, only deliver events whose name is in this set (module scoping). */
	events?: Set<string>;
	write: (chunk: string) => void;
}

interface BroadcastPayload {
	origin: string;
	keys: string[];
	event: string;
	data: unknown;
}

const HEARTBEAT_MS = 15_000;

@Injectable()
export class SseService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(SseService.name);
	private readonly clients = new Map<string, SseClient>();
	private readonly instanceId =
		`inst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
	private heartbeatTimer: NodeJS.Timeout | null = null;
	private sequence = 0;

	constructor(private readonly redis: RedisService) {}

	onModuleInit() {
		// not awaited: an unreachable Redis must not block startup;
		// ioredis keeps the subscription pending and retries
		this.redis
			.subscribe(RedisChannel.sseBroadcast, (raw) => {
				try {
					const payload = JSON.parse(raw) as BroadcastPayload;
					// skip events we already delivered locally when publishing
					if (payload.origin !== this.instanceId) {
						this.fanoutLocal(payload);
					}
				} catch {
					// ignore malformed payloads
				}
			})
			.then(() => this.logger.log("Redis SSE pub/sub initialized"))
			.catch((err) =>
				this.logger.error(`Failed to init Redis SSE pub/sub: ${err}`),
			);

		this.heartbeatTimer = setInterval(() => {
			for (const client of this.clients.values()) {
				try {
					client.write(": ping\n\n");
				} catch {
					this.unregister(client.id);
				}
			}
		}, HEARTBEAT_MS);
	}

	register(client: SseClient): void {
		this.clients.set(client.id, client);
		this.logger.log(
			`SSE client connected: ${client.id} (keys: ${[...client.keys].join(", ")})`,
		);
		this.sendTo(client, "connected", { clientId: client.id });
	}

	unregister(clientId: string): void {
		if (this.clients.delete(clientId)) {
			this.logger.log(`SSE client disconnected: ${clientId}`);
		}
	}

	/**
	 * Publish an event to every connected client whose keys intersect
	 * with the target keys (e.g. ["org:<id>", "conversation:<id>"]).
	 * Fanout goes through Redis pub/sub so it reaches clients
	 * connected to any server instance.
	 */
	async publish(keys: string[], event: string, data: unknown): Promise<void> {
		const payload: BroadcastPayload = {
			origin: this.instanceId,
			keys,
			event,
			data,
		};

		// deliver to clients attached to this instance right away
		this.fanoutLocal(payload);

		// not awaited: a slow or down Redis must not delay the caller
		this.redis
			.publish(RedisChannel.sseBroadcast, JSON.stringify(payload))
			.catch((err) =>
				this.logger.warn(`Redis SSE publish failed: ${err.message}`),
			);
	}

	nextClientId(): string {
		return `sse_${Date.now()}_${++this.sequence}`;
	}

	private fanoutLocal(payload: BroadcastPayload): void {
		for (const client of this.clients.values()) {
			const match = payload.keys.some((key) => client.keys.has(key));
			if (match && (!client.events || client.events.has(payload.event))) {
				this.sendTo(client, payload.event, payload.data);
			}
		}
	}

	private sendTo(client: SseClient, event: string, data: unknown): void {
		try {
			client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
		} catch (err) {
			this.logger.warn(`Failed to write to client ${client.id}: ${err}`);
			this.unregister(client.id);
		}
	}

	onModuleDestroy() {
		if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
		this.clients.clear();
	}
}
