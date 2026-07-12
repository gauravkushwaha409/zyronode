import { Global, Module, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { RedisService } from "./redis.service";

@Global()
@Module({
	providers: [
		{
			provide: RedisService,
			useFactory: () => {
				const client = new Redis({
					host: process.env.REDIS_HOST || "localhost",
					port: Number(process.env.REDIS_PORT) || 6379,
				});
				return new RedisService(client);
			},
		},
	],
	exports: [RedisService],
})
export class RedisModule {}
