import { CONFIG } from "@/config";
import { useQuery } from "@package/tanstack-react-query";
import { authApiService } from "../../services";

export function useMeQuery() {
    return useQuery(
        CONFIG.QUERY_KEY.AUTH.ME, 
        () =>  authApiService.me(),
        null
    )
}