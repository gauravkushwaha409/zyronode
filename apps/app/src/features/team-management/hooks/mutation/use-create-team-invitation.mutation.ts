import type { APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { teamManagementApiService } from "../../services";
import type { TeamInvitation } from "../../types";

export function useCreateTeamInvitationMutation(organizationId: string) {
	return useMutation<
		TeamInvitation.ItemAxiosResponse,
		APIError,
		TeamInvitation.CreatePayload
	>(
		(payload) =>
			teamManagementApiService.createTeamInvitation(organizationId, payload),
		{
			invalidateKeys: [CONFIG.QUERY_KEY.TEAM_INVITATION.LIST(organizationId)],
		},
	);
}
