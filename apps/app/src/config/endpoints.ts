export const ENDPOINTS = {
	AUTH: {
		LOGIN: "/auth/login",
		SIGNUP: "/auth/sign-up",
		REGISTER: "/auth/register",
		ME: "/auth/me",
		LOGOUT: "/auth/logout",
		FORGOT_PASSWORD: "/auth/password/forgot",
		VERIFY_FORGOT_PASSWORD: "/auth/password/forgot/verify",
		VERIFY_EMAIL: "/auth/verify-email",
		RESEND_EMAIL: "/auth/resend-verification",
		USER_ONBOARDING: "/auth/user-onboarding",
	},
	ORGANIZATION: {
		CREATE: "/organization",
		GET_MY: "/organization/my",
		SWITCH: "/organization/switch",
		MEMBERS: (organizationId: string) =>
			`/organization/${organizationId}/members`,
	},
	ROLE: {
		LIST: (organizationId: string) => `/organizations/${organizationId}/roles`,
		DETAIL: (organizationId: string, roleId: string) =>
			`/organizations/${organizationId}/roles/${roleId}`,
		PERMISSIONS: (organizationId: string) =>
			`/organizations/${organizationId}/permissions`,
	},
	TEAM: {
		LIST: (organizationId: string) => `/organizations/${organizationId}/teams`,
		DETAIL: (organizationId: string, teamId: string) =>
			`/organizations/${organizationId}/teams/${teamId}`,
		MEMBERS: (organizationId: string, teamId: string) =>
			`/organizations/${organizationId}/teams/${teamId}/members`,
		MEMBER: (organizationId: string, teamId: string, memberId: string) =>
			`/organizations/${organizationId}/teams/${teamId}/members/${memberId}`,
	},
	TEAM_INVITATION: {
		LIST: (organizationId: string) =>
			`/organizations/${organizationId}/team-invitations`,
		CREATE: (organizationId: string) =>
			`/organizations/${organizationId}/team-invitations`,
		REVOKE: (organizationId: string, invitationId: string) =>
			`/organizations/${organizationId}/team-invitations/${invitationId}/revoke`,
	},
	INBOX: {
		CONVERSATIONS: "/inbox/conversations",
		CONVERSATION: "/inbox/conversations",
		CREATE_CONVERSATION: "/conversations",
		SEND_MESSAGE: "/conversations",
		MARK_READ: "/conversations",
		UNREAD_STATS: "/inbox/conversations/unread-stats/analytics",
		MESSAGES: (conversationId: string) =>
			`/conversations/${conversationId}/messages`,
		UPLOAD: (conversationId: string) =>
			`/conversations/${conversationId}/uploads`,
	},
	VISITOR: {
		// every visitor route is tenant-scoped by path; the backend
		// re-checks membership so the id here is never trusted on its own
		LIST: (organizationId: string) => `/organizations/${organizationId}/visitors`,
		INFO: (organizationId: string, visitorId: string) =>
			`/organizations/${organizationId}/visitors/${visitorId}`,
		UPDATE_DETAILS: (organizationId: string, visitorId: string) =>
			`/organizations/${organizationId}/visitors/${visitorId}`,
		ASSIGNEE: (organizationId: string, visitorId: string) =>
			`/organizations/${organizationId}/visitors/${visitorId}/assignee`,
		NOTES: (organizationId: string, visitorId: string) =>
			`/organizations/${organizationId}/visitors/${visitorId}/notes`,
		STAT_CARDS: (organizationId: string) =>
			`/organizations/${organizationId}/visitors/analytics/stat-cards`,
		BY_COUNTRY: (organizationId: string) =>
			`/organizations/${organizationId}/visitors/analytics/by-country`,
		TOP_PAGES: (organizationId: string) =>
			`/organizations/${organizationId}/visitors/analytics/top-pages`,
		COUNTRY_OPTIONS: (organizationId: string) =>
			`/organizations/${organizationId}/visitors/filters/countries`,
	},
};
