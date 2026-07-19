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
	const lastOrdId = auth.user?.data?.data?.lastOrgId
	const user = auth.user?.data?.data

	if (user?.id && lastOrdId) {
		window.location.href = `${ENV.APP_URL}/${lastOrdId}/dashboard`;
	}
}

export const authGaurds = {
	authentication: authenticationGuard,
}