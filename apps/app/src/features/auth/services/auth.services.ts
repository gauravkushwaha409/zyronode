import { type ApiResponse, type AxiosRequestConfig, BaseAPIService } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type {
	LoginMutation,
	LogoutMutation,
	MeQuery,
	RegisterMutationTypes,
} from "../types";

class AuthApiServices extends BaseAPIService {
	async login(
		data: LoginMutation.LoginMutationPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			LoginMutation.LoginMutationData,
			LoginMutation.LoginMutationAxiosResponse,
			LoginMutation.LoginMutationPayload
		>(CONFIG.ENDPOINTS.AUTH.LOGIN, data, axiosConfiguration);
	}

	async register(
		data: RegisterMutationTypes.RegisterMutationPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			null,
			ApiResponse<null>,
			RegisterMutationTypes.RegisterMutationPayload
		>(CONFIG.ENDPOINTS.AUTH.REGISTER, data, axiosConfiguration);
	}

	async me(axiosConfiguration?: AxiosRequestConfig) {
		return super.get<MeQuery.MeQueryData, MeQuery.MeQueryAxiosResponse>(
			CONFIG.ENDPOINTS.AUTH.ME,
			axiosConfiguration,
		);
	}

	async logout(axiosConfiguration?: AxiosRequestConfig) {
		return super.post<
			LogoutMutation.LogoutMutationData,
			LogoutMutation.LogoutMutationAxiosResponse
		>(CONFIG.ENDPOINTS.AUTH.LOGOUT, undefined, axiosConfiguration);
	}
}
export const authApiService = new AuthApiServices(apiClient);
