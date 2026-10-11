import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import type { ServerOptions } from "socket.io";

/**
 * Socket.IO adapter backed by Redis pub/sub so signaling (rooms, emits)
 * works across multiple server instances. Uses dedicated pub/sub clients -
 * a subscribed client cannot run other commands, so these are separate
 * from the app RedisService client.
 */
export class RedisIoAdapter extends IoAdapter {
	private adapterConstructor?: ReturnType<typeof createAdapter>;

	createIOServer(port: number, options?: ServerOptions) {
		const server = super.createIOServer(port, options);
		const host = process.env.REDIS_HOST || "localhost";
		const portNum = Number(process.env.REDIS_PORT) || 6379;
		const pubClient = new Redis({ host, port: portNum, maxRetriesPerRequest: 3 });
		const subClient = pubClient.duplicate();
		pubClient.on("error", (err) => {
			console.error("[RedisIoAdapter] pub client error:", err.message);
		});
		subClient.on("error", (err) => {
			console.error("[RedisIoAdapter] sub client error:", err.message);
		});
		this.adapterConstructor = createAdapter(pubClient, subClient);
		server.adapter(this.adapterConstructor);
		return server;
	}
}
