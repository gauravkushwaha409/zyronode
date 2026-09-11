import { type AxiosRequestConfig, BaseAPIService } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type {
	CreateRolePayload,
	DeleteRoleResponse,
	PermissionItem,
	PermissionListAxiosResponse,
	RoleItem,
	RoleItemAxiosResponse,
	RoleListAxiosResponse,
	UpdateRolePayload,
} from "../types";

class TeamManagementApiService extends BaseAPIService {
	async listRoles(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<RoleItem[], RoleListAxiosResponse>(
			CONFIG.ENDPOINTS.ROLE.LIST(organizationId),
			axiosConfiguration,
		);
	}

	async listPermissions(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<PermissionItem[], PermissionListAxiosResponse>(
			CONFIG.ENDPOINTS.ROLE.PERMISSIONS(organizationId),
			axiosConfiguration,
		);
	}

	async createRole(
		organizationId: string,
		payload: CreateRolePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<RoleItem, RoleItemAxiosResponse, CreateRolePayload>(
			CONFIG.ENDPOINTS.ROLE.LIST(organizationId),
			payload,
			axiosConfiguration,
		);
	}

	async updateRole(
		organizationId: string,
		roleId: string,
		payload: UpdateRolePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		const response = await super.patch<UpdateRolePayload>(
			CONFIG.ENDPOINTS.ROLE.DETAIL(organizationId, roleId),
			payload,
			axiosConfiguration,
		);
		return response as RoleItemAxiosResponse;
	}

	async deleteRole(
		organizationId: string,
		roleId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		const response = await super.delete<{ id: string }>(
			CONFIG.ENDPOINTS.ROLE.DETAIL(organizationId, roleId),
			axiosConfiguration,
		);
		return response as unknown as DeleteRoleResponse;
	}
}

export const teamManagementApiService = new TeamManagementApiService(apiClient);
