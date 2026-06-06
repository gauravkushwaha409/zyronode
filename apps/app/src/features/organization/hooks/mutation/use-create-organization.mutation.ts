import type { APIError } from "@package/api-client";
import { useMutation } from "@package/tanstack-react-query";
import { toast } from "@package/ui";
import { useNavigate } from "@tanstack/react-router";
import { organizationApiService } from "../../services";
import type { OrganizationMutation } from "../../types";

export function useCreateOrganizationMutation() {
	const navigate = useNavigate();
	return useMutation<
		OrganizationMutation.OrganizationMutationAxiosResponse,
		APIError,
		OrganizationMutation.CreateOrganizationPayload
	>((data) => organizationApiService.create(data), {
		onSuccess: (data) => {
			toast.success("Organization created successfully");
			navigate({
				to: "/$organization/dashboard",
				params: { organization: data?.data?.data?.id },
			});
		},
		onError: (error) => {
			console.error("Failed to create organization", error);
			toast.error("Failed to create organization");
		},
	});
}
