import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { Team } from "../../types";

export function useRemoveTeamMemberMutation(
	organizationId: string,
	teamId: string,
) {
	return useMutation<Team.ItemAxiosResponse, APIError, string>(
		(memberId) =>
			teamManagementApiService.removeTeamMember(organizationId, teamId, memberId),
		{ invalidateKeys: [CONFIG.QUERY_KEY.TEAM.LIST(organizationId)] },
	);
}
