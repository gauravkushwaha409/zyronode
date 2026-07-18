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

export function authenticatedGuard(user: RouterContext["auth"]) {
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
	if (user.isError && user.error_code === "ONBOARDING_REQUIRED") {
		window.location.href = `${ENV.APP_URL}/verify/onboarding?onboarding=user`;
		return;
	}
}

export function organizationOnboardingGaurd(user: RouterContext["auth"]) {
	if (user?.isError && user?.error_code === "ORGANIZATION_NOT_FOUND") {
		window.location.href = `${ENV.APP_URL}/verify/onboarding?onboarding=organization`;
		return;
	}
}

export function redirectAuthenticatedUserToApp(auth: RouterContext["auth"]) {
	// const currentOrganization = auth.user?.data?.data?.current_organization;
	// const user = auth.user?.data?.user;

	// if (user?.uuid && currentOrganization?.uuid) {
	// 	window.location.href = `${ENV.APP_URL}/${currentOrganization.uuid}/dashboard`;
	// }
}
