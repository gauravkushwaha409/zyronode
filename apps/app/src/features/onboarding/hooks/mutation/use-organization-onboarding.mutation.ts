import { useMutation } from "@package/query";
import { toast } from "@package/ui";
import { useRouter } from "@tanstack/react-router";
import { onboardingApiService } from "../../services/onboarding-api.service";
import type { OrganizationOnboardingMutation } from "../../types";

export function useOrganizationOnboardingMutation() {
	const router = useRouter();
	return useMutation<
		OrganizationOnboardingMutation.OrganizationOnboardingMutationAxiosResponse,
		OrganizationOnboardingMutation.OrganizationOnboardingErrorResponse,
		OrganizationOnboardingMutation.OrganizationOnboardingMutationPayload
	>((data) => onboardingApiService.organizationOnboarding(data), {
		onSuccess: async (data) => {
			toast.success(data?.data?.message);
			router.navigate({ to: "/onboarding/success" });
		},
		onError: async (error) => {
			toast.error(error?.response?.data?.error);
		},
	});
}
