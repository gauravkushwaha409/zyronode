export const ADMIN_ENDPOINTS = {
	AUTH: {
		LOGIN: "/admin/auth/login",
		ME: "/admin/auth/me",
		LOGOUT: "/admin/auth/logout",
	},
	ORGANIZATIONS: {
		LIST: "/admin/organizations",
	},
	USERS: {
		LIST: "/admin/users",
	},
} as const;

export const ADMIN_QUERY_KEY = {
	AUTH: {
		ME: ["admin", "auth", "me"] as const,
	},
	ORGANIZATIONS: {
		LIST: ["admin", "organizations", "list"] as const,
	},
	USERS: {
		LIST: ["admin", "users", "list"] as const,
	},
} as const;
