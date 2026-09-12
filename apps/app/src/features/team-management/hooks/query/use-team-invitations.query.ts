import type { APIError } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { TeamInvitation } from "../../types";

export function useTeamInvitationsQuery(organizationId: string) {
	return useQuery<TeamInvitation.ListAxiosResponse, APIError>(
		CONFIG.QUERY_KEY.TEAM_INVITATION.LIST(organizationId),
		() => teamManagementApiService.listTeamInvitations(organizationId),
		undefined,
		{ enabled: Boolean(organizationId) },
	);
}
