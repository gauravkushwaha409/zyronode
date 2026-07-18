import { ENV } from "@/config/env";
import { useMeQuery } from "@/features/auth/hooks";

export function useSuccessOnboarding() {
	const { data, isError } = useMeQuery();

	if (isError) {
		throw new Error("User not found");
	}

	// const organizationId = data?.data?.lastOrgId;
	const organizationId = "test-org-id"; // Replace with actual logic to get the organization ID


	if (!organizationId) {
		throw new Error("Organization not found");
	}

	const handleStart = () => {
		window.location.href = `${ENV.APP_URL}/${organizationId}/dashboard`;
	};

	return { handleStart };
}
