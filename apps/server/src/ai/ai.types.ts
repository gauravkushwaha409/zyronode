export const AI_ACTIONS = [
	"fix_grammar",
	"rephrase",
	"elaborate",
	"friendly",
	"formal",
] as const;

export type AiAction = (typeof AI_ACTIONS)[number];

export interface OpenRouterMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface OpenRouterUsage {
	prompt_tokens?: number;
	completion_tokens?: number;
	total_tokens?: number;
	cost?: number;
}

export interface OpenRouterResult {
	text: string;
	model: string;
	usage?: OpenRouterUsage;
}
