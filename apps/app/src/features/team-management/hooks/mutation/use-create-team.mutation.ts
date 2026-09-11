import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { Team } from "../../types";

export function useCreateTeamMutation(organizationId: string) {
	return useMutation<Team.ItemAxiosResponse, APIError, Team.CreatePayload>(
		(payload) => teamManagementApiService.createTeam(organizationId, payload),
		{ invalidateKeys: [CONFIG.QUERY_KEY.TEAM.LIST(organizationId)] },
	);
}
