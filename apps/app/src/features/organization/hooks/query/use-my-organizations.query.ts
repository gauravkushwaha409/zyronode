import type { APIError } from "@package/api-client";
import { useQuery } from "@package/tanstack-react-query";
import { CONFIG } from "@/config";
import { organizationApiService } from "../../services";
import type { OrganizationList } from "../../types";

export function useMyOrganizationsQuery() {
	return useQuery<
		OrganizationList.OrganizationListAxiosResponse,
		APIError
	>(CONFIG.QUERY_KEY.ORGANIZATION.MY, () =>
		organizationApiService.getMyOrganizations(),
	);
}
