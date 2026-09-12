import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { Team } from "../../types";

export function useAddTeamMembersMutation(
	organizationId: string,
	teamId: string,
) {
	return useMutation<Team.ItemAxiosResponse, APIError, Team.AddMembersPayload>(
		(payload) =>
			teamManagementApiService.addTeamMembers(organizationId, teamId, payload),
		{ invalidateKeys: [CONFIG.QUERY_KEY.TEAM.LIST(organizationId)] },
	);
}
