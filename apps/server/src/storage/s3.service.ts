import {
	CreateBucketCommand,
	HeadBucketCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

/**
 * Thin wrapper around the AWS S3 SDK, pointed at LocalStack in dev via
 * `S3_ENDPOINT` (docker: `http://localstack:4566`). In front of a real AWS
 * account, unset `S3_ENDPOINT` and this talks to real S3 — same code path.
 */
@Injectable()
export class S3Service implements OnModuleInit {
	private readonly logger = new Logger(S3Service.name);
	private readonly client: S3Client;
	private readonly bucket: string;

	constructor() {
		this.bucket = process.env.S3_BUCKET || "zyro-chat-uploads";
		const endpoint = process.env.S3_ENDPOINT;
		this.client = new S3Client({
			region: process.env.AWS_REGION || "us-east-1",
			endpoint: endpoint || undefined,
			forcePathStyle: !!endpoint, // LocalStack requires path-style addressing
			credentials: endpoint
				? { accessKeyId: "test", secretAccessKey: "test" }
				: undefined,
		});
	}

	/** Dev convenience: LocalStack starts empty, so make sure the bucket exists. */
	async onModuleInit() {
		if (!process.env.S3_ENDPOINT) return; // real AWS: bucket is provisioned out-of-band
		try {
			await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
			this.logger.log(`Bucket "${this.bucket}" already exists`);
		} catch (headErr) {
			this.logger.warn(`Bucket "${this.bucket}" not found (${(headErr as Error).name}), creating it`);
			try {
				await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
				this.logger.log(`Created LocalStack bucket "${this.bucket}"`);
			} catch (createErr) {
				this.logger.error(`Could not create bucket "${this.bucket}": ${(createErr as Error).message}`);
			}
		}
	}

	async putObject(params: {
		key: string;
		body: Buffer;
		contentType?: string;
	}): Promise<{ key: string; url: string }> {
		const command = new PutObjectCommand({
			Bucket: this.bucket,
			Key: params.key,
			Body: params.body,
			ContentType: params.contentType,
		});
		try {
			await this.client.send(command);
		} catch (err) {
			// LocalStack's in-memory store can drop the bucket without the
			// container restarting (dev-only quirk) — recreate once and retry
			// rather than failing every upload until someone notices and
			// bounces the stack.
			if ((err as { name?: string }).name === "NoSuchBucket" && process.env.S3_ENDPOINT) {
				await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
				await this.client.send(command);
			} else {
				throw err;
			}
		}
		return { key: params.key, url: this.publicUrl(params.key) };
	}

	/** Public URL for reading the object back (LocalStack path-style / real S3 virtual-hosted). */
	publicUrl(key: string): string {
		const base = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT;
		if (base) {
			return `${base.replace(/\/$/, "")}/${this.bucket}/${key}`;
		}
		return `https://${this.bucket}.s3.amazonaws.com/${key}`;
	}
}
