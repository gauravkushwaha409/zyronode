import { useQuery } from "@package/query";
import { ADMIN_QUERY_KEY } from "@/config/admin-api";
import { adminOrganizationsService } from "../services/admin-organizations.service";
import type {
	AdminOrganizationListError,
	AdminOrganizationListParams,
	AdminOrganizationListResponse,
} from "../types";

export function useAdminOrganizationsQuery(
	params: AdminOrganizationListParams,
) {
	return useQuery<AdminOrganizationListResponse, AdminOrganizationListError>(
		[
			...ADMIN_QUERY_KEY.ORGANIZATIONS.LIST,
			params.page,
			params.limit,
			params.search ?? "",
		],
		() => adminOrganizationsService.list(params),
		undefined,
		{ placeholderData: (previous) => previous },
	);
}
