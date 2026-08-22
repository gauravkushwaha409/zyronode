import type { ApiResponse, APIError } from "@package/api-client";
import { useMutation } from "@package/query";
import { CONFIG } from "@/config";
import { inboxApiService } from "../../services/inbox-api.service";
import type {
  InboxSendAgentMessagePayload,
  InboxMessage,
} from "../../types/inbox-api.types";

export function useSendAgentMessageMutation(conversationId: string, organizationId: string) {
  return useMutation<
    ApiResponse<InboxMessage>,
    APIError,
    InboxSendAgentMessagePayload
  >(
    (payload) => inboxApiService.sendAgentMessage(conversationId, payload),
    {
      invalidateKeys: [
        CONFIG.QUERY_KEY.INBOX.CONVERSATION_DETAIL(conversationId, organizationId),
        CONFIG.QUERY_KEY.INBOX.CONVERSATIONS(organizationId),
      ],
    },
  );
}
