import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { organizationApiService } from "../../services";
import type { OrganizationMutation } from "../../types";

export function useCreateOrganizationMutation() {
	return useMutation<
		OrganizationMutation.OrganizationMutationAxiosResponse,
		APIError,
		OrganizationMutation.CreateOrganizationPayload
	>((data) => organizationApiService.create(data), {
		invalidateKeys: [CONFIG.QUERY_KEY.AUTH.ME, CONFIG.QUERY_KEY.ORGANIZATION.MY],
	});
}
