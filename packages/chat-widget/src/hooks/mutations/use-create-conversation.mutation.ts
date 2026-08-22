import { useMutation } from "@package/query";
import { getWidgetApi } from "../../services/widget-api.service";
import type {
  CreateConversationAxiosResponse,
  CreateConversationError,
  CreateConversationPayload,
} from "../../types";

export function useCreateConversationMutation() {
  return useMutation<
    CreateConversationAxiosResponse,
    CreateConversationError,
    CreateConversationPayload
  >((
    payload: CreateConversationPayload,
  ) => getWidgetApi().createConversation(payload));
}
