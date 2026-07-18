import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { toast } from "@package/ui";
import { useRouter } from "@tanstack/react-router";
import { CONFIG } from "@/config";
import { onboardingApiService } from "../../services/onboarding-api.service";
import type { UserOnboardingMutation } from "../../types";

export function useUserOnboardingMutation() {
	const router = useRouter();
	return useMutation<
		UserOnboardingMutation.UserOnboardingMutationAxiosResponse,
		APIError,
		UserOnboardingMutation.UserOnboardingMutationPayload
	>((data) => onboardingApiService.userOnboarding(data), {
		invalidateKeys: [CONFIG.QUERY_KEY.AUTH.ME],
		onSuccess: (data) => {
			toast.success(data?.data?.message);
			router.invalidate();
			router.navigate({ to: "/onboarding/organization" });
		},
		onError: (error) => {
			toast.error(error?.response?.data?.error);
		},
	});
}
