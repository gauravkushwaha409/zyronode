import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { TeamInvitation } from "../../types";

export function useRevokeTeamInvitationMutation(
	organizationId: string,
	invitationId: string,
) {
	return useMutation<TeamInvitation.RevokeAxiosResponse, APIError, void>(
		() =>
			teamManagementApiService.revokeTeamInvitation(organizationId, invitationId),
		{
			invalidateKeys: [CONFIG.QUERY_KEY.TEAM_INVITATION.LIST(organizationId)],
		},
	);
}
