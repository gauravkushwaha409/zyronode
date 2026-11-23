import {
	BadGatewayException,
	Injectable,
	Logger,
	ServiceUnavailableException,
} from "@nestjs/common";
import { OpenRouter } from "@openrouter/sdk";
import type {
	OpenRouterMessage,
	OpenRouterResult,
	OpenRouterUsage,
} from "./ai.types";

// `openrouter/free` routes to whichever free model is available right now.
// Override with OPENROUTER_MODEL to pin a specific `:free` model.
const DEFAULT_MODEL = "openrouter/free";

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

		const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
		const maxTokens =
			options?.maxTokens ?? (Number(process.env.AI_MAX_OUTPUT_TOKENS) || 800);
		const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 30_000;

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

		const client = new OpenRouter({
			apiKey,
			httpReferer: process.env.OPENROUTER_SITE_URL || undefined,
			appTitle: process.env.OPENROUTER_APP_NAME || undefined,
			serverURL: process.env.OPENROUTER_BASE_URL || undefined,
			timeoutMs,
		});

		for (let attempt = 0; attempt < 2; attempt += 1) {
			try {
				const response = await client.responses.send({
					responsesRequest: {
						model,
						...(fallbackModels.length ? { models: fallbackModels } : {}),
						...(instructions ? { instructions } : {}),
						input,
						maxOutputTokens: maxTokens,
						temperature: options?.temperature ?? 0.4,
					},
				});

				if (!("output" in response)) {
					throw new BadGatewayException(
						"AI provider returned an unexpected response",
					);
				}
				if (response.status !== "completed") {
					throw new BadGatewayException(
						response.error?.message ?? `AI response ended as ${response.status}`,
					);
				}

				const message = response.output.find((item) => item.type === "message");
				const text = message?.content
					?.filter((part) => part.type === "output_text")
					.map((part) => part.text)
					.join("")
					.trim();
				if (!text) {
					throw new BadGatewayException("AI provider returned an empty response");
				}

				const usage: OpenRouterUsage | undefined = response.usage
					? {
							prompt_tokens: response.usage.inputTokens,
							completion_tokens: response.usage.outputTokens,
							total_tokens: response.usage.totalTokens,
							cost: response.usage.cost ?? undefined,
						}
					: undefined;

				return {
					text,
					model: response.model ?? model,
					usage,
				};
			} catch (error) {
				if (
					error instanceof ServiceUnavailableException ||
					error instanceof BadGatewayException
				) {
					throw error;
				}

				const status = (error as { statusCode?: number } | null)?.statusCode;
				const transient = status === undefined || status === 429 || status >= 500;
				if (attempt === 0 && transient) {
					this.logger.warn(
						`OpenRouter request failed, retrying: ${
							error instanceof Error ? error.message : "unknown error"
						}`,
					);
					continue;
				}

				this.logger.error(
					`OpenRouter request failed: ${
						error instanceof Error ? error.message : "unknown error"
					}`,
				);
				throw new ServiceUnavailableException("AI provider is unavailable");
			}
		}

		throw new ServiceUnavailableException("AI provider is unavailable");
	}
}
