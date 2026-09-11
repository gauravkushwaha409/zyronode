import { type AxiosRequestConfig, BaseAPIService } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type { Permission, Role } from "../types";

class TeamManagementApiService extends BaseAPIService {
	private static instance: TeamManagementApiService;

	private constructor() {
		super(apiClient);
	}

	static getInstance(): TeamManagementApiService {
		if (!TeamManagementApiService.instance) {
			TeamManagementApiService.instance = new TeamManagementApiService();
		}
		return TeamManagementApiService.instance;
	}

	async listRoles(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<Role.Item[], Role.ListAxiosResponse>(
			CONFIG.ENDPOINTS.ROLE.LIST(organizationId),
			axiosConfiguration,
		);
	}

	async listPermissions(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<Permission.Item[], Permission.ListAxiosResponse>(
			CONFIG.ENDPOINTS.ROLE.PERMISSIONS(organizationId),
			axiosConfiguration,
		);
	}

	async createRole(
		organizationId: string,
		payload: Role.CreatePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<Role.Item, Role.ItemAxiosResponse, Role.CreatePayload>(
			CONFIG.ENDPOINTS.ROLE.LIST(organizationId),
			payload,
			axiosConfiguration,
		);
	}

	async updateRole(
		organizationId: string,
		roleId: string,
		payload: Role.UpdatePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		const response = await super.patch<Role.UpdatePayload>(
			CONFIG.ENDPOINTS.ROLE.DETAIL(organizationId, roleId),
			payload,
			axiosConfiguration,
		);
		return response as Role.ItemAxiosResponse;
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
		return response as unknown as Role.DeleteResponse;
	}
}

export const teamManagementApiService = TeamManagementApiService.getInstance();
