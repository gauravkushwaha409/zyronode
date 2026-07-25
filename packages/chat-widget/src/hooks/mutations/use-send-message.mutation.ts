import { useMutation } from "@package/query";
import { widgetApi } from "../../services/widget-api.service";
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
  >((payload: SendMessagePayload) => widgetApi.sendVisitorMessage(sessionId, payload));
}
