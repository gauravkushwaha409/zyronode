import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import type Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
	private readonly logger = new Logger(RedisService.name);

	constructor(private readonly client: Redis) {}

	async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		if (ttlSeconds) {
			await this.client.set(key, value, "EX", ttlSeconds);
		} else {
			await this.client.set(key, value);
		}
	}

	async get(key: string): Promise<string | null> {
		return this.client.get(key);
	}

	async del(key: string): Promise<void> {
		await this.client.del(key);
	}

	async exists(key: string): Promise<boolean> {
		const result = await this.client.exists(key);
		return result === 1;
	}

	async getTtl(key: string): Promise<number> {
		return this.client.ttl(key);
	}

	onModuleDestroy() {
		this.client.disconnect();
		this.logger.log("Redis connection closed");
	}
}
