export const ADMIN_ENDPOINTS = {
	AUTH: {
		LOGIN: "/admin/auth/login",
		ME: "/admin/auth/me",
		LOGOUT: "/admin/auth/logout",
	},
} as const;

export const ADMIN_QUERY_KEY = {
	AUTH: {
		ME: ["admin", "auth", "me"] as const,
	},
} as const;
