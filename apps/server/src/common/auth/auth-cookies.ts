import type { Response } from "express";

/**
 * Cookie names are intentionally separate for the portal and the platform
 * admin app. A browser can be logged into both at the same time without one
 * session overwriting the other.
 */
export const AUTH_COOKIES = {
	USER_ACCESS: "access",
	USER_REFRESH: "refresh",
	ADMIN_ACCESS: "admin_access",
	ADMIN_REFRESH: "admin_refresh",
} as const;

export function authCookieOptions(maxAge: number) {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		maxAge,
	};
}

export function setAdminAuthCookies(
	response: Response,
	tokens: { access: string; refresh: string },
) {
	const options = authCookieOptions(24 * 60 * 60 * 1000);
	response.cookie(AUTH_COOKIES.ADMIN_ACCESS, tokens.access, options);
	response.cookie(AUTH_COOKIES.ADMIN_REFRESH, tokens.refresh, options);
}

export function clearAdminAuthCookies(response: Response) {
	response.clearCookie(AUTH_COOKIES.ADMIN_ACCESS);
	response.clearCookie(AUTH_COOKIES.ADMIN_REFRESH);
}
