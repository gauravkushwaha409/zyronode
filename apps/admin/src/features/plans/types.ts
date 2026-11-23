import type { APIError, ApiResponse } from "@package/api-client";

export interface AdminPlan {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	monthlyPrice: number;
	annualPrice: number;
	maxMembers: number | null;
	maxVisitors: number | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface PlanPayload {
	name: string;
	slug: string;
	description?: string;
	monthlyPrice?: number;
	annualPrice?: number;
	maxMembers?: number;
	maxVisitors?: number;
	isActive?: boolean;
}

export type PlansResponse = ApiResponse<{ items: AdminPlan[] }>;
export type PlanResponse = ApiResponse<AdminPlan>;
export type PlansError = APIError;
