import { BaseAPIService } from "@package/api-client";
import { ADMIN_ENDPOINTS } from "@/config/admin-api";
import { apiClient } from "@/lib/api-client";
import type { AdminPlan, PlanPayload, PlanResponse, PlansResponse } from "../types";

class AdminPlansService extends BaseAPIService {
	list() {
		return super.get<{ items: AdminPlan[] }, PlansResponse>(ADMIN_ENDPOINTS.PLANS.LIST);
	}

	create(payload: PlanPayload) {
		return super.post<AdminPlan, PlanResponse>(ADMIN_ENDPOINTS.PLANS.CREATE, payload);
	}

	update(planId: string, payload: Partial<PlanPayload>) {
		return super.patch<Partial<PlanPayload>>(ADMIN_ENDPOINTS.PLANS.UPDATE(planId), payload) as Promise<PlanResponse>;
	}
}

export const adminPlansService = new AdminPlansService(apiClient);
