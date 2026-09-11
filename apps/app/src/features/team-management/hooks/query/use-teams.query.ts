import type { APIError } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { Team } from "../../types";

export function useTeamsQuery(organizationId: string) {
	return useQuery<Team.ListAxiosResponse, APIError>(
		CONFIG.QUERY_KEY.TEAM.LIST(organizationId),
		() => teamManagementApiService.listTeams(organizationId),
		undefined,
		{ enabled: Boolean(organizationId) },
	);
}
