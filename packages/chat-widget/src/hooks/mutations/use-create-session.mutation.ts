import { useMutation } from "@package/query";
import { widgetApi } from "../../services/widget-api.service";
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
  >((payload: CreateSessionPayload) => widgetApi.createSession(payload));
}
