import type { APIError, ApiResponse } from "@package/api-client";
import { useMutation } from "@package/query";
import { inboxApiService } from "../../services/inbox-api.service";
import type { InboxUploadedFile } from "../../types/inbox-api.types";

export function useUploadInboxFileMutation(
	conversationId: string,
	organizationId: string,
) {
	return useMutation<ApiResponse<InboxUploadedFile>, APIError, File>(
		(file) => inboxApiService.uploadFile(conversationId, organizationId, file),
	);
}
