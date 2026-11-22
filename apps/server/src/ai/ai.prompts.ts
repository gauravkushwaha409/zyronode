import type { AiAction, OpenRouterMessage } from "./ai.types";

const BASE_SYSTEM = [
	"You are an assistant for a customer-support agent working in a live chat inbox.",
	"Return only the message text the agent should send.",
	"Do not wrap it in quotes, labels, markdown fences or explanations.",
	"Preserve the original meaning, facts, names and numbers.",
	"Never invent promises, prices, policies or personal data.",
	"Reply in the same language as the text you are given.",
].join(" ");

const ACTION_INSTRUCTIONS: Record<AiAction, string> = {
	fix_grammar:
		"Fix spelling, grammar and punctuation. Keep the wording, tone and length as close to the original as possible.",
	rephrase:
		"Rewrite the text with different wording while keeping the same meaning, tone and approximate length.",
	elaborate:
		"Expand the text with useful, relevant detail. Keep it concise and do not add facts that are not implied by the original.",
	friendly:
		"Rewrite the text in a warm, friendly and approachable tone without becoming unprofessional.",
	formal: "Rewrite the text in a clear, professional and formal tone.",
};

export function buildRewriteMessages(
	text: string,
	action: AiAction,
): OpenRouterMessage[] {
	return [
		{
			role: "system",
			content: `${BASE_SYSTEM} ${ACTION_INSTRUCTIONS[action]}`,
		},
		{ role: "user", content: text },
	];
}

export function buildSuggestReplyMessages(
	transcript: string,
): OpenRouterMessage[] {
	return [
		{
			role: "system",
			content: [
				BASE_SYSTEM,
				"You are drafting the agent's next reply to the visitor in the conversation below.",
				"Use the recent context, answer the visitor's latest message and move the conversation forward.",
				"Be helpful, concise and polite. Do not mention that you are an AI.",
			].join(" "),
		},
		{
			role: "user",
			content: `Conversation so far:\n${transcript}\n\nWrite the agent's next reply.`,
		},
	];
}
