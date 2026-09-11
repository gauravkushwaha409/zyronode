import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { Team } from "../../types";

export function useDeleteTeamMutation(organizationId: string, teamId: string) {
	return useMutation<Team.DeleteResponse, APIError, void>(
		() => teamManagementApiService.deleteTeam(organizationId, teamId),
		{ invalidateKeys: [CONFIG.QUERY_KEY.TEAM.LIST(organizationId)] },
	);
}
