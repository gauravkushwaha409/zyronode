import { Global, Module } from "@nestjs/common";
import Redis from "ioredis";
import { RedisService } from "./redis.service";

@Global()
@Module({
	providers: [
		{
			provide: RedisService,
			useFactory: () => {
				console.log("[Redis] Initializing Redis client...", process.env.REDIS_HOST, process.env.REDIS_PORT);
				const client = new Redis({
					host: process.env.REDIS_HOST || "localhost",
					port: Number(process.env.REDIS_PORT) || 6379,
					maxRetriesPerRequest: 3,
					retryStrategy(times) {
						if (times > 10) return null;
						return Math.min(times * 200, 2000);
					},
				});

				client.on("error", (err) => {
					console.error("[Redis] Connection error:", err.message);
				});

				client.on("connect", () => {
					console.log("[Redis] Connected");
				});

				return new RedisService(client);
			},
		},
	],
	exports: [RedisService],
})
export class RedisModule {}
