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

	/** Sorted-set upsert: member's score becomes `score` (replaces any existing score). */
	async zAdd(key: string, score: number, member: string): Promise<void> {
		await this.client.zadd(key, score, member);
	}

	async zRem(key: string, member: string): Promise<void> {
		await this.client.zrem(key, member);
	}

	async zScore(key: string, member: string): Promise<number | null> {
		const score = await this.client.zscore(key, member);
		return score === null ? null : Number(score);
	}

	/** Members with score in [min, max], inclusive. */
	async zRangeByScore(
		key: string,
		min: number,
		max: number | "+inf" = "+inf",
	): Promise<string[]> {
		return this.client.zrangebyscore(key, min, max);
	}

	/** Count of members with score in [min, max], inclusive. */
	async zCountByScore(
		key: string,
		min: number,
		max: number | "+inf" = "+inf",
	): Promise<number> {
		return this.client.zcount(key, min, max);
	}

	/** Drops members with score < min - garbage-collects entries nothing will ZREM. */
	async zRemRangeByScoreBelow(key: string, min: number): Promise<void> {
		await this.client.zremrangebyscore(key, "-inf", `(${min}`);
	}

	onModuleDestroy() {
		this.client.disconnect();
		this.logger.log("Redis connection closed");
	}
}
