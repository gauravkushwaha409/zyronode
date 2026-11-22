import {
	BadGatewayException,
	Injectable,
	Logger,
	ServiceUnavailableException,
} from "@nestjs/common";
import type {
	OpenRouterMessage,
	OpenRouterResult,
	OpenRouterUsage,
} from "./ai.types";

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
// `openrouter/free` routes to whichever free model is available right now.
// Override with OPENROUTER_MODEL to pin a specific `:free` model.
const DEFAULT_MODEL = "openrouter/free";

interface ResponsesOutputContent {
	type?: string;
	text?: string;
}

interface ResponsesOutputItem {
	type?: string;
	content?: ResponsesOutputContent[];
}

interface ResponsesUsage {
	input_tokens?: number;
	output_tokens?: number;
	total_tokens?: number;
	cost?: number;
}

interface OpenRouterResponsesResponse {
	model?: string;
	status?: string;
	output?: ResponsesOutputItem[];
	usage?: ResponsesUsage;
}

function extractText(json: OpenRouterResponsesResponse): string {
	const message = (json.output ?? []).find((item) => item.type === "message");
	if (!message?.content) return "";
	return message.content
		.filter(
			(part) => part.type === "output_text" && typeof part.text === "string",
		)
		.map((part) => part.text)
		.join("")
		.trim();
}

@Injectable()
export class OpenRouterClient {
	private readonly logger = new Logger(OpenRouterClient.name);

	async chat(
		messages: OpenRouterMessage[],
		options?: { maxTokens?: number; temperature?: number },
	): Promise<OpenRouterResult> {
		if (process.env.AI_ENABLED === "false") {
			throw new ServiceUnavailableException("AI features are disabled");
		}

		const apiKey = process.env.OPENROUTER_API_KEY;
		if (!apiKey) {
			throw new ServiceUnavailableException("AI is not configured");
		}

		const baseUrl = (process.env.OPENROUTER_BASE_URL ?? DEFAULT_BASE_URL).replace(
			/\/+$/,
			"",
		);
		const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
		const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 30_000;
		const maxTokens =
			options?.maxTokens ?? (Number(process.env.AI_MAX_OUTPUT_TOKENS) || 800);

		const fallbackModels = (process.env.OPENROUTER_FALLBACK_MODELS ?? "")
			.split(",")
			.map((value) => value.trim())
			.filter(Boolean);

		const instructions = messages
			.filter((message) => message.role === "system")
			.map((message) => message.content)
			.join("\n\n");
		const input = messages
			.filter((message) => message.role !== "system")
			.map((message) => ({ role: message.role, content: message.content }));

		const body: Record<string, unknown> = {
			model,
			input,
			max_output_tokens: maxTokens,
			temperature: options?.temperature ?? 0.4,
		};
		if (instructions) body.instructions = instructions;
		if (fallbackModels.length) body.models = fallbackModels;

		const headers: Record<string, string> = {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		};
		if (process.env.OPENROUTER_SITE_URL) {
			headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
		}
		if (process.env.OPENROUTER_APP_NAME) {
			headers["X-OpenRouter-Title"] = process.env.OPENROUTER_APP_NAME;
		}

		for (let attempt = 0; attempt < 2; attempt += 1) {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), timeoutMs);

			try {
				const response = await fetch(`${baseUrl}/responses`, {
					method: "POST",
					headers,
					body: JSON.stringify(body),
					signal: controller.signal,
				});

				if (!response.ok) {
					const detail = await response.text().catch(() => "");
					this.logger.error(
						`OpenRouter ${response.status}: ${detail.slice(0, 500)}`,
					);
					if ((response.status === 429 || response.status >= 500) && attempt === 0) {
						continue;
					}
					throw new ServiceUnavailableException("AI provider is unavailable");
				}

				const json = (await response.json()) as OpenRouterResponsesResponse;
				const text = extractText(json);
				if (!text) {
					throw new BadGatewayException("AI provider returned an empty response");
				}

				const usage: OpenRouterUsage | undefined = json.usage
					? {
							prompt_tokens: json.usage.input_tokens,
							completion_tokens: json.usage.output_tokens,
							total_tokens: json.usage.total_tokens,
							cost: json.usage.cost,
						}
					: undefined;

				return {
					text,
					model: json.model ?? model,
					usage,
				};
			} catch (error) {
				if (
					error instanceof ServiceUnavailableException ||
					error instanceof BadGatewayException
				) {
					throw error;
				}
				if (attempt === 0) {
					this.logger.warn(
						`OpenRouter request failed, retrying: ${
							error instanceof Error ? error.message : "unknown error"
						}`,
					);
					continue;
				}
				throw new ServiceUnavailableException("AI provider is unavailable");
			} finally {
				clearTimeout(timer);
			}
		}

		throw new ServiceUnavailableException("AI provider is unavailable");
	}
}
