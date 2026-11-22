export namespace AiTypes {
	export type AiAction =
		| "fix_grammar"
		| "rephrase"
		| "elaborate"
		| "friendly"
		| "formal";

	export interface RewritePayload {
		text: string;
		action: AiAction;
	}

	export interface SuggestReplyPayload {
		organizationId: string;
	}

	export interface AiTextResult {
		text: string;
	}
}
