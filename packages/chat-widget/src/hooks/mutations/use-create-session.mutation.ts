import { useMutation } from "@package/query";
import { getWidgetApi } from "../../services/widget-api.service";
import type {
  CreateSessionAxiosResponse,
  CreateSessionError,
  CreateSessionPayload,
} from "../../types";

export function useCreateSessionMutation() {
  return useMutation<
    CreateSessionAxiosResponse,
    CreateSessionError,
    CreateSessionPayload
  >((payload: CreateSessionPayload) => getWidgetApi().createSession(payload));
}
