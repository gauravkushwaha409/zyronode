import { type AxiosRequestConfig, BaseAPIService } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type { Permission, Role, Team, TeamInvitation } from "../types";

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

	async listTeams(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<Team.Item[], Team.ListAxiosResponse>(
			CONFIG.ENDPOINTS.TEAM.LIST(organizationId),
			axiosConfiguration,
		);
	}

	async createTeam(
		organizationId: string,
		payload: Team.CreatePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<Team.Item, Team.ItemAxiosResponse, Team.CreatePayload>(
			CONFIG.ENDPOINTS.TEAM.LIST(organizationId),
			payload,
			axiosConfiguration,
		);
	}

	async updateTeam(
		organizationId: string,
		teamId: string,
		payload: Team.UpdatePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		const response = await super.patch<Team.UpdatePayload>(
			CONFIG.ENDPOINTS.TEAM.DETAIL(organizationId, teamId),
			payload,
			axiosConfiguration,
		);
		return response as Team.ItemAxiosResponse;
	}

	async deleteTeam(
		organizationId: string,
		teamId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		const response = await super.delete<{ id: string }>(
			CONFIG.ENDPOINTS.TEAM.DETAIL(organizationId, teamId),
			axiosConfiguration,
		);
		return response as unknown as Team.DeleteResponse;
	}

	async addTeamMembers(
		organizationId: string,
		teamId: string,
		payload: Team.AddMembersPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<Team.Item, Team.ItemAxiosResponse, Team.AddMembersPayload>(
			CONFIG.ENDPOINTS.TEAM.MEMBERS(organizationId, teamId),
			payload,
			axiosConfiguration,
		);
	}

	async removeTeamMember(
		organizationId: string,
		teamId: string,
		memberId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		const response = await super.delete<never>(
			CONFIG.ENDPOINTS.TEAM.MEMBER(organizationId, teamId, memberId),
			axiosConfiguration,
		);
		return response as unknown as Team.ItemAxiosResponse;
	}

	async listTeamInvitations(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<TeamInvitation.Item[], TeamInvitation.ListAxiosResponse>(
			CONFIG.ENDPOINTS.TEAM_INVITATION.LIST(organizationId),
			axiosConfiguration,
		);
	}

	async createTeamInvitation(
		organizationId: string,
		payload: TeamInvitation.CreatePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<
			TeamInvitation.Item,
			TeamInvitation.ItemAxiosResponse,
			TeamInvitation.CreatePayload
		>(
			CONFIG.ENDPOINTS.TEAM_INVITATION.CREATE(organizationId),
			payload,
			axiosConfiguration,
		);
	}

	async revokeTeamInvitation(
		organizationId: string,
		invitationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		const response = await super.patch(
			CONFIG.ENDPOINTS.TEAM_INVITATION.REVOKE(organizationId, invitationId),
			undefined,
			axiosConfiguration,
		);
		return response as TeamInvitation.RevokeAxiosResponse;
	}
}

export const teamManagementApiService = TeamManagementApiService.getInstance();
