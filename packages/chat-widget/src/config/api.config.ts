export const CHAT_WIDGET_API = {
	CONVERSATIONS: "/conversations",
	VISITOR_SESSION_START: (organizationId: string) =>
		`/organizations/${organizationId}/visitors/session-start`,
	CONVERSATION_MESSAGES: (conversationId: string) =>
		`/conversations/${conversationId}/messages`,
	CONVERSATION_VISITOR_MESSAGES: (conversationId: string) =>
		`/conversations/${conversationId}/messages/visitor`,
} as const;
