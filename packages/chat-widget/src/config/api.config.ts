export const CHAT_WIDGET_API = {
	// All widget traffic is unauthenticated (no visitor login) — every route
	// here must hit the `/widget/*` public surface (WidgetController), never
	// the agent-facing routes those mirror. Those are guarded or, if not,
	// have no reason to special-case an unauthenticated caller (e.g. they'd
	// leak agent-only data like internal notes).
	CONVERSATIONS: "/widget/conversations",
	VISITOR_SESSION_START: (organizationId: string) =>
		`/organizations/${organizationId}/visitors/session-start`,
	CONVERSATION_MESSAGES: (conversationId: string) =>
		`/widget/conversations/${conversationId}/messages`,
	CONVERSATION_VISITOR_MESSAGES: (conversationId: string) =>
		`/widget/conversations/${conversationId}/messages`,
} as const;
