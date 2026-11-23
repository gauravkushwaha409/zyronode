import { useMutation, useQuery } from "@package/query";
import { ADMIN_QUERY_KEY } from "@/config/admin-api";
import { adminPlansService } from "../services/admin-plans.service";
import type { PlanPayload, PlanResponse, PlansError, PlansResponse } from "../types";

export function useAdminPlansQuery() {
	return useQuery<PlansResponse, PlansError>(
		[...ADMIN_QUERY_KEY.PLANS.LIST],
		() => adminPlansService.list(),
	);
}

export function useCreateAdminPlanMutation() {
	return useMutation<PlanResponse, PlansError, PlanPayload>(
		(payload) => adminPlansService.create(payload),
		{ invalidateKeys: [ADMIN_QUERY_KEY.PLANS.LIST] },
	);
}

export function useUpdateAdminPlanMutation(planId: string) {
	return useMutation<PlanResponse, PlansError, Partial<PlanPayload>>(
		(payload) => adminPlansService.update(planId, payload),
		{ invalidateKeys: [ADMIN_QUERY_KEY.PLANS.LIST] },
	);
}
