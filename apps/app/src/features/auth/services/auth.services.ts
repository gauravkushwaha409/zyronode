import { CONFIG } from "@/config";
import { apiClient, BaseAPIService } from "@package/api-client";

class AuthApiServices extends BaseAPIService {

    async login(axiosConfiguration: AxiosRequestConfig) {
        return super.post(CONFIG.ENDPOINTS.AUTH.LOGIN, axiosConfiguration)
    }

    async register(axiosConfiguration: AxiosRequestConfig) {
        return super.post(CONFIG.ENDPOINTS.AUTH.REGISTER, axiosConfiguration)
    }

}
export const authApiService = new AuthApiServices(apiClient)