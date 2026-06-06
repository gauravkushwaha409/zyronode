import { useMutation } from "@package/tanstack-react-query";
import { authApiService } from "../../services";

export function useLogoutMutation() {
    return useMutation(()=>authApiService.logout())
}