export const ADMIN_ENDPOINTS = {
	AUTH: {
		LOGIN: "/admin/auth/login",
		ME: "/admin/auth/me",
		LOGOUT: "/admin/auth/logout",
	},
	ORGANIZATIONS: {
		LIST: "/admin/organizations",
	},
	PLANS: {
		LIST: "/admin/plans",
		CREATE: "/admin/plans",
		UPDATE: (planId: string) => `/admin/plans/${planId}`,
	},
	USERS: {
		LIST: "/admin/users",
	},
	ROLES: {
		LIST: "/admin/roles",
		CREATE: "/admin/roles",
		UPDATE: (roleId: string) => `/admin/roles/${roleId}`,
		DELETE: (roleId: string) => `/admin/roles/${roleId}`,
	},
	PERMISSIONS: {
		LIST: "/admin/permissions",
	},
	PLATFORM_STAFF: {
		LIST: "/admin/platform-staff",
		UPDATE_ROLE: (userId: string) => `/admin/users/${userId}/platform-role`,
	},
} as const;

export const ADMIN_QUERY_KEY = {
	AUTH: {
		ME: ["admin", "auth", "me"] as const,
	},
	ORGANIZATIONS: {
		LIST: ["admin", "organizations", "list"] as const,
	},
	PLANS: {
		LIST: ["admin", "plans", "list"] as const,
	},
	USERS: {
		LIST: ["admin", "users", "list"] as const,
	},
	ROLES: {
		LIST: ["admin", "roles", "list"] as const,
	},
	PERMISSIONS: {
		LIST: ["admin", "permissions", "list"] as const,
	},
	PLATFORM_STAFF: {
		LIST: ["admin", "platform-staff", "list"] as const,
	},
} as const;
