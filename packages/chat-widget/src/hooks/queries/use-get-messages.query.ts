import { useQuery } from "@package/query";
import { getWidgetApi } from "../../services/widget-api.service";
import type {
  GetMessagesAxiosResponse,
  GetMessagesError,
} from "../../types";
import { WIDGET_QUERY_KEYS } from "../query-keys";

export function useGetMessagesQuery(conversationId: string | undefined) {
  return useQuery<GetMessagesAxiosResponse, GetMessagesError>(
    WIDGET_QUERY_KEYS.MESSAGES(conversationId ?? ""),
    () => getWidgetApi().getMessages(conversationId!),
    undefined,
    { enabled: !!conversationId },
  );
}
