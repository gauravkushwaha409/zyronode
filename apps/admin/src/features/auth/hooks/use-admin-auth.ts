import { useMutation, useQuery } from "@package/query";
import { ADMIN_QUERY_KEY } from "@/config/admin-api";
import { adminAuthService } from "../services/admin-auth.service";
import type {
	AdminAPIError,
	AdminLoginPayload,
	AdminLoginResponse,
	AdminMeResponse,
} from "../types";

export function useAdminMeQuery() {
	return useQuery<AdminMeResponse, AdminAPIError>(
		ADMIN_QUERY_KEY.AUTH.ME,
		() => adminAuthService.me(),
	);
}

export function useAdminLoginMutation() {
	return useMutation<
		AdminLoginResponse,
		AdminAPIError,
		AdminLoginPayload
	>((data) => adminAuthService.login(data));
}

export function useAdminLogoutMutation() {
	return useMutation(() => adminAuthService.logout());
}
