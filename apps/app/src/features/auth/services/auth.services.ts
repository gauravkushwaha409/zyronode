import { CONFIG } from "@/config";
import {  BaseAPIService, type AxiosRequestConfig } from "@package/api-client";
import type {  LoginMutationTypes, MeQuery, RegisterMutationTypes,  } from "../types";
import { apiClient } from "@/lib";

class AuthApiServices extends BaseAPIService {

    async login(data: LoginMutationTypes.LoginMutationPayload, axiosConfiguration?: AxiosRequestConfig) {
        return super.post(CONFIG.ENDPOINTS.AUTH.LOGIN, data, axiosConfiguration)
    }

    async register(data: RegisterMutationTypes.RegisterMutationPayload, axiosConfiguration?: AxiosRequestConfig) {
        return super.post(CONFIG.ENDPOINTS.AUTH.REGISTER, data, axiosConfiguration)
    }

    async me(axiosConfiguration?: AxiosRequestConfig) {
        return super.get<MeQuery.MeQueryResponse>(CONFIG.ENDPOINTS.AUTH.ME, axiosConfiguration)
    }

}
export const authApiService = new AuthApiServices(apiClient)