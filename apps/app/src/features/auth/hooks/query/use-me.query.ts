import type { APIError } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { authApiService } from "../../services";
import type { MeQuery } from "../../types";

export function useMeQuery() {
	return useQuery<MeQuery.MeQueryAxiosResponse, APIError>(
		CONFIG.QUERY_KEY.AUTH.ME,
		() => authApiService.me(),
	);
}
