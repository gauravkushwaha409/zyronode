import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { authApiService } from "../../services";

export function useLogoutMutation() {
	return useMutation(() => authApiService.logout(), {
		invalidateKeys: [CONFIG.QUERY_KEY.AUTH.ME],
	});
}
