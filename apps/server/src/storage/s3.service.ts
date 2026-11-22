import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";

@Injectable()
export class S3Service {
	private readonly client: S3Client;
	private readonly bucket: string;
	private readonly region: string;

	constructor() {
		this.bucket = process.env.S3_BUCKET || "zyronode-uploads";
		this.region = process.env.AWS_REGION || "us-east-1";
		this.client = new S3Client({ region: this.region });
	}

	async putObject(params: {
		key: string;
		body: Buffer;
		contentType?: string;
	}): Promise<{ key: string; url: string }> {
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: params.key,
				Body: params.body,
				ContentType: params.contentType,
			}),
		);

		return { key: params.key, url: this.publicUrl(params.key) };
	}

	publicUrl(key: string): string {
		const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
		if (base) {
			return `${base}/${key}`;
		}
		return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
	}
}
