import { redirect } from "@tanstack/react-router";
import type React from "react";
import { ENV } from "@/config/env";
import type { RouterContext } from "@/routes/__root";
import { useMeQuery } from "../hooks";

export function AuthGaurd({ children }: { children: React.ReactNode }) {
	const user = useMeQuery();

	if (user?.status === "success") return <>{children}</>;
	return null;
}

export function domainGuard() {
	// No-op for single-domain app - auth and app are on the same domain
	return false;
}

export function authenticationGuard(user: RouterContext["auth"]) {
	if (
		user.isError &&
		(user.error_code === "UNAUTHENTICATED" ||
			user.error_code === "SESSION_EXPIRED")
	) {
		window.location.href = `${ENV.APP_URL}/auth/login`;
		return;
	}
}

export function sessionGuard(user: RouterContext["auth"]) {
	if (user.isError && user.error_code === "SESSION_EXPIRED") {
		window.location.href = `${ENV.APP_URL}/auth/login`;
		return;
	}
}

export function emailVerifyGuard(user: RouterContext["auth"]) {
	if (user.isError && user.error_code === "EMAIL_UNVERIFIED") {
		window.location.href = `${ENV.APP_URL}/verify/email`;
		return;
	}
}

export function onboardingGuard(user: RouterContext["auth"]) {
	if (user.isError && user.error_code === "USER_ONBOARDING_REQUIRED") {
		window.location.href = `${ENV.APP_URL}/onboarding/user`;
		return;
	}
}

export function organizationOnboardingGaurd(user: RouterContext["auth"]) {
	if (user?.isError && user?.error_code === "ORGANIZATION_ONBOARDING_REQUIRED") {
		window.location.href = `${ENV.APP_URL}/onboarding/organization`;
		return;
	}
}

export function redirectAuthenticatedUserToApp(auth: RouterContext["auth"]) {
	const lastOrdId = auth.user?.data?.data?.lastOrgId;
	const user = auth.user?.data?.data;

	if (user?.id && lastOrdId) {
		window.location.href = `${ENV.APP_URL}/${lastOrdId}/dashboard`;
	}
}

/**
 * Keeps the org id in the URL in sync with the user's active
 * organization (lastOrgId from the me query). If they diverge,
 * redirects to the same location with the org id replaced -
 * query params are preserved.
 *
 * Call from beforeLoad of the /_organization-protected/$organization
 * route (parent auth guards run first).
 */
export function activeOrganizationGuard({
	auth,
	organizationId,
}: {
	auth: RouterContext["auth"];
	organizationId: string;
}) {
	const lastOrgId = auth.user?.data?.data?.lastOrgId;

	if (!auth.isError && lastOrgId && lastOrgId !== organizationId) {
		throw redirect({
			to: "/$organization",
			params: { organization: lastOrgId },
			// keep whatever query params the current URL carries
			search: true,
			replace: true,
		});
	}
}

export const authGaurds = {
	authentication: authenticationGuard,
};
