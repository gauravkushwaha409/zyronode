import { useQuery } from "@package/query";
import { ADMIN_QUERY_KEY } from "@/config/admin-api";
import { adminUsersService } from "../services/admin-users.service";
import type {
	AdminUserListError,
	AdminUserListParams,
	AdminUserListResponse,
} from "../types";

export function useAdminUsersQuery(params: AdminUserListParams) {
	return useQuery<AdminUserListResponse, AdminUserListError>(
		[
			...ADMIN_QUERY_KEY.USERS.LIST,
			params.page,
			params.limit,
			params.search ?? "",
		],
		() => adminUsersService.list(params),
		undefined,
		{ placeholderData: (previous) => previous },
	);
}
