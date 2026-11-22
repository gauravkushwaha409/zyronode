import {
	BadGatewayException,
	Injectable,
	Logger,
	ServiceUnavailableException,
} from "@nestjs/common";
import { OpenRouter } from "@openrouter/sdk";
import type { ChatMessages, ChatResult } from "@openrouter/sdk/models";
import { OpenRouterError } from "@openrouter/sdk/models/errors";
import type {
	OpenRouterMessage,
	OpenRouterResult,
	OpenRouterUsage,
} from "./ai.types";

const DEFAULT_MODEL = "openrouter/free";

function extractText(response: ChatResult): string {
	const choice = response.choices?.[0];
	if (!choice?.message) return "";

	const content = choice.message.content;
	if (typeof content === "string") {
		return content.trim();
	}

	if (Array.isArray(content)) {
		return content
			.filter(
				(part) =>
					part.type === "text" &&
					typeof (part as { text?: unknown }).text === "string",
			)
			.map((part) => (part as { text: string }).text)
			.join("")
			.trim();
	}

	return "";
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

		const serverURL = process.env.OPENROUTER_BASE_URL
			? process.env.OPENROUTER_BASE_URL.replace(/\/+$/, "")
			: undefined;
		const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
		const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 30_000;
		const maxTokens =
			options?.maxTokens ?? (Number(process.env.AI_MAX_OUTPUT_TOKENS) || 800);

		const fallbackModels = (process.env.OPENROUTER_FALLBACK_MODELS ?? "")
			.split(",")
			.map((value) => value.trim())
			.filter(Boolean);

		const client = new OpenRouter({
			apiKey,
			serverURL,
			httpReferer: process.env.OPENROUTER_SITE_URL,
			appTitle: process.env.OPENROUTER_APP_NAME,
			timeoutMs,
			retryConfig: {
				strategy: "backoff",
				backoff: {
					initialInterval: 500,
					maxInterval: 2000,
					exponent: 1.5,
					maxElapsedTime: timeoutMs,
				},
				retryConnectionErrors: true,
			},
		});

		const chatMessages: ChatMessages[] = messages.map((message) => {
			if (message.role === "system") {
				return { role: "system", content: message.content };
			}
			if (message.role === "assistant") {
				return { role: "assistant", content: message.content };
			}
			return { role: "user", content: message.content };
		});

		try {
			const response = await client.chat.send({
				chatRequest: {
					model,
					messages: chatMessages,
					maxTokens,
					temperature: options?.temperature ?? 0.4,
					...(fallbackModels.length > 0 ? { models: fallbackModels } : {}),
				},
			});

			const text = extractText(response);
			if (!text) {
				throw new BadGatewayException("AI provider returned an empty response");
			}

			const usage: OpenRouterUsage | undefined = response.usage
				? {
						prompt_tokens: response.usage.promptTokens,
						completion_tokens: response.usage.completionTokens,
						total_tokens: response.usage.totalTokens,
						cost: response.usage.cost ?? undefined,
					}
				: undefined;

			return {
				text,
				model: response.model || model,
				usage,
			};
		} catch (error) {
			if (
				error instanceof ServiceUnavailableException ||
				error instanceof BadGatewayException
			) {
				throw error;
			}

			if (error instanceof OpenRouterError) {
				this.logger.error(
					`OpenRouter ${error.statusCode}: ${error.body?.slice(0, 500) || error.message}`,
				);
				if (error.statusCode === 400 || error.statusCode === 422) {
					throw new BadGatewayException("AI provider rejected request");
				}
				throw new ServiceUnavailableException("AI provider is unavailable");
			}

			this.logger.error(
				`OpenRouter request failed: ${
					error instanceof Error ? error.message : "unknown error"
				}`,
			);
			throw new ServiceUnavailableException("AI provider is unavailable");
		}
	}
}
