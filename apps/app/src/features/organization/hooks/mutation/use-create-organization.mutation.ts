import type { APIError } from "@package/api-client";
import { useMutation } from "@package/tanstack-react-query";
import { toast } from "@package/ui";
import { useRouter } from "@tanstack/react-router";
import { organizationApiService } from "../../services";
import type { OrganizationMutation } from "../../types";

export function useCreateOrganizationMutation() {
	const router = useRouter();
	return useMutation<
		OrganizationMutation.OrganizationMutationAxiosResponse,
		APIError,
		OrganizationMutation.CreateOrganizationPayload
	>((data) => organizationApiService.create(data), {
		onSuccess: (data) => {
			router.navigate({
				to: "/$organization/dashboard",
				params: {
					organization: data?.data?.data?.id || "",
				},
			});
			toast.success("Organization created successfully");
		},
		onError: (error) => {
			console.error("Failed to create organization", error);
			toast.error("Failed to create organization");
		},
	});
}
