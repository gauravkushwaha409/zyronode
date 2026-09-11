export const QUERY_KEY = {
	AUTH: {
		ME: ["me"],
		LOGIN: ["auth-login"],
		SIGN_UP: ["auth-sign-up"],
	},
	ORGANIZATION: {
		MY: ["organization", "my"],
		MEMBERS: (organizationId: string) =>
			["organization", organizationId, "members"] as const,
	},
	ROLE: {
		LIST: (organizationId: string) =>
			["organization", organizationId, "roles"] as const,
		PERMISSIONS: (organizationId: string) =>
			["organization", organizationId, "permissions"] as const,
	},
	TEAM: {
		LIST: (organizationId: string) =>
			["organization", organizationId, "teams"] as const,
	},
	TEAM_INVITATION: {
		LIST: (organizationId: string) =>
			["organization", organizationId, "team-invitations"] as const,
	},
	INBOX: {
		CONVERSATIONS: (organizationId: string, filters?: Record<string, unknown>) =>
			["inbox", "conversations", organizationId, filters] as const,
		CONVERSATION_DETAIL: (
			conversationId: string | null,
			organizationId: string,
		) => ["inbox", "conversation", conversationId, organizationId] as const,
		UNREAD_STATS: ["inbox", "unread-stats"] as const,
		MESSAGES: (conversationId: string | null, limit?: number) =>
			["inbox", "messages", conversationId, limit] as const,
	},
	VISITOR: {
		/** Root key - invalidate this to refresh every visitor query at once. */
		ALL: (organizationId: string) => ["visitor", organizationId] as const,
		// `unknown` so feature-owned param types can be passed without
		// being forced to extend Record<string, unknown>
		LIST: (organizationId: string, filters?: unknown) =>
			["visitor", organizationId, "list", filters] as const,
		INFO: (organizationId: string, visitorId: string | null) =>
			["visitor", organizationId, "info", visitorId] as const,
		NOTES: (organizationId: string, visitorId: string | null) =>
			["visitor", organizationId, "notes", visitorId] as const,
		STAT_CARDS: (organizationId: string) =>
			["visitor", organizationId, "stat-cards"] as const,
		BY_COUNTRY: (organizationId: string) =>
			["visitor", organizationId, "by-country"] as const,
		TOP_PAGES: (organizationId: string) =>
			["visitor", organizationId, "top-pages"] as const,
		COUNTRY_OPTIONS: (organizationId: string) =>
			["visitor", organizationId, "country-options"] as const,
	},
};
