import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { organizationApiService } from "../../services";
import type { SwitchOrganizationMutation } from "../../types";

export function useSwitchOrganizationMutation() {
	return useMutation<
		SwitchOrganizationMutation.SwitchOrganizationAxiosResponse,
		SwitchOrganizationMutation.SwitchOrganizationErrorResponse,
		string
	>(
		(organizationId) => organizationApiService.switchOrganization(organizationId),
		{
			invalidateKeys: [CONFIG.QUERY_KEY.AUTH.ME, CONFIG.QUERY_KEY.ORGANIZATION.MY],
		},
	);
}
