import { type ApiResponse, type AxiosRequestConfig, BaseAPIService } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type {
	ForgotPasswordMutation,
	LoginMutation,
	LogoutMutation,
	MeQuery,
	RegisterMutationTypes,
	ResendEmailMutation,
	SetPasswordMutation,
	SignUpMutation,
	VerifyEmailMutation,
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

	async signUp(
		data: SignUpMutation.SignUpMutationPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			SignUpMutation.SignUpMutationResponseData,
			SignUpMutation.SignUpMutationAxiosResponse,
			SignUpMutation.SignUpMutationPayload
		>(CONFIG.ENDPOINTS.AUTH.SIGNUP, data, axiosConfiguration);
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

	async forgotPassword(
		payload: ForgotPasswordMutation.ForgotPasswordPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			ForgotPasswordMutation.ForgotPasswordResponseData,
			ForgotPasswordMutation.ForgotPasswordMutationAxiosResponse,
			ForgotPasswordMutation.ForgotPasswordPayload
		>(CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, payload, axiosConfiguration);
	}

	async setPassword(
		payload: SetPasswordMutation.SetPasswordPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			SetPasswordMutation.SetPasswordData,
			SetPasswordMutation.SetPasswordMutationAxiosResponse,
			SetPasswordMutation.SetPasswordPayload
		>(CONFIG.ENDPOINTS.AUTH.VERIFY_FORGOT_PASSWORD, payload, axiosConfiguration);
	}

	async verifyEmail(
		payload: VerifyEmailMutation.VerifyEmailMutationPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			VerifyEmailMutation.VerifyEmailMutationData,
			VerifyEmailMutation.VerifyEmailMutationAxiosResponse,
			VerifyEmailMutation.VerifyEmailMutationPayload
		>(CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, payload, axiosConfiguration);
	}

	async resendEmail(axiosConfiguration?: AxiosRequestConfig) {
		return super.post<
			ResendEmailMutation.ResendEmailMutationResponseData,
			ResendEmailMutation.ResendEmailMutationAxiosResponse
		>(CONFIG.ENDPOINTS.AUTH.RESEND_EMAIL, undefined, axiosConfiguration);
	}
}

export const authApiService = new AuthApiServices(apiClient);
