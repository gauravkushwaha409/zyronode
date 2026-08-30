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
		MEMBERS: (organizationId: string) =>
			`/organization/${organizationId}/members`,
	},
	INBOX: {
		CONVERSATIONS: "/inbox/conversations",
		CONVERSATION: "/inbox/conversations",
		CREATE_CONVERSATION: "/conversations",
		SEND_MESSAGE: "/conversations",
		MARK_READ: "/conversations",
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
