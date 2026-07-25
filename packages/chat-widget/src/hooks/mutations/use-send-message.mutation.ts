import { useMutation } from "@package/query";
import { getWidgetApi } from "../../services/widget-api.service";
import { WIDGET_QUERY_KEYS } from "../query-keys";
import type {
  SendMessageAxiosResponse,
  SendMessageError,
  SendMessagePayload,
} from "../../types";

export function useSendMessageMutation(sessionId: string) {
  return useMutation<
    SendMessageAxiosResponse,
    SendMessageError,
    SendMessagePayload
  >((payload: SendMessagePayload) => getWidgetApi().sendVisitorMessage(sessionId, payload), {
    invalidateKeys: [WIDGET_QUERY_KEYS.MESSAGES(sessionId)],
  });
}
