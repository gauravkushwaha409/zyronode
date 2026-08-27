import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { visitorApiService } from "../../services";
import type {
	AssignVisitorAgentPayload,
	CreateVisitorNotePayload,
	UpdateVisitorDetailsPayload,
} from "../../types";

/**
 * All three invalidate the feature's root key rather than hand-picking
 * queries - stat cards, the list and the open detail panel can all shift
 * from a single edit.
 */
export function useUpdateVisitorDetailsMutation(
	organizationId: string,
	visitorId: string,
) {
	return useMutation<unknown, Error, UpdateVisitorDetailsPayload>(
		(payload) =>
			visitorApiService.updateDetails(organizationId, visitorId, payload),
		{ invalidateKeys: [CONFIG.QUERY_KEY.VISITOR.ALL(organizationId)] },
	);
}

export function useAssignVisitorAgentMutation(
	organizationId: string,
	visitorId: string,
) {
	return useMutation<unknown, Error, AssignVisitorAgentPayload>(
		(payload) =>
			visitorApiService.assignAgent(organizationId, visitorId, payload),
		{ invalidateKeys: [CONFIG.QUERY_KEY.VISITOR.ALL(organizationId)] },
	);
}

export function useCreateVisitorNoteMutation(
	organizationId: string,
	visitorId: string,
) {
	return useMutation<unknown, Error, CreateVisitorNotePayload>(
		(payload) => visitorApiService.createNote(organizationId, visitorId, payload),
		{ invalidateKeys: [CONFIG.QUERY_KEY.VISITOR.ALL(organizationId)] },
	);
}
