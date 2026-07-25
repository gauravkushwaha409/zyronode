import { useQuery } from "@package/query";
import { getWidgetApi } from "../../services/widget-api.service";
import type {
  GetMessagesAxiosResponse,
  GetMessagesError,
} from "../../types";
import { WIDGET_QUERY_KEYS } from "../query-keys";

export function useGetMessagesQuery(sessionId: string | undefined) {
  return useQuery<GetMessagesAxiosResponse, GetMessagesError>(
    WIDGET_QUERY_KEYS.MESSAGES(sessionId ?? ""),
    () => getWidgetApi().getMessages(sessionId!),
    undefined,
    { enabled: !!sessionId },
  );
}
