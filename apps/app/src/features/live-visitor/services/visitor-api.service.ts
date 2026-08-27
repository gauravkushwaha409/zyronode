import { type AxiosRequestConfig, BaseAPIService } from "@package/api-client";
import { CONFIG } from "@/config";
import { apiClient } from "@/lib";
import type {
	AssignVisitorAgentPayload,
	CreateVisitorNotePayload,
	UpdateVisitorDetailsPayload,
	VisitorByCountryData,
	VisitorCountryOption,
	VisitorInfo,
	VisitorListData,
	VisitorListParams,
	VisitorNote,
	VisitorStatCards,
	VisitorTopPagesData,
} from "../types";

class VisitorApiService extends BaseAPIService {
	async list(
		organizationId: string,
		params?: VisitorListParams,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<VisitorListData>(
			CONFIG.ENDPOINTS.VISITOR.LIST(organizationId),
			{
				params,
				...axiosConfiguration,
			},
		);
	}

	async info(
		organizationId: string,
		visitorId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<VisitorInfo>(
			CONFIG.ENDPOINTS.VISITOR.INFO(organizationId, visitorId),
			axiosConfiguration,
		);
	}

	async statCards(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<VisitorStatCards>(
			CONFIG.ENDPOINTS.VISITOR.STAT_CARDS(organizationId),
			axiosConfiguration,
		);
	}

	async byCountry(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<VisitorByCountryData>(
			CONFIG.ENDPOINTS.VISITOR.BY_COUNTRY(organizationId),
			axiosConfiguration,
		);
	}

	async topPages(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<VisitorTopPagesData>(
			CONFIG.ENDPOINTS.VISITOR.TOP_PAGES(organizationId),
			axiosConfiguration,
		);
	}

	async countryOptions(
		organizationId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<VisitorCountryOption[]>(
			CONFIG.ENDPOINTS.VISITOR.COUNTRY_OPTIONS(organizationId),
			axiosConfiguration,
		);
	}

	async notes(
		organizationId: string,
		visitorId: string,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.get<VisitorNote[]>(
			CONFIG.ENDPOINTS.VISITOR.NOTES(organizationId, visitorId),
			axiosConfiguration,
		);
	}

	async updateDetails(
		organizationId: string,
		visitorId: string,
		payload: UpdateVisitorDetailsPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.patch<UpdateVisitorDetailsPayload>(
			CONFIG.ENDPOINTS.VISITOR.UPDATE_DETAILS(organizationId, visitorId),
			payload,
			axiosConfiguration,
		);
	}

	async assignAgent(
		organizationId: string,
		visitorId: string,
		payload: AssignVisitorAgentPayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.patch<AssignVisitorAgentPayload>(
			CONFIG.ENDPOINTS.VISITOR.ASSIGNEE(organizationId, visitorId),
			payload,
			axiosConfiguration,
		);
	}

	async createNote(
		organizationId: string,
		visitorId: string,
		payload: CreateVisitorNotePayload,
		axiosConfiguration?: AxiosRequestConfig,
	) {
		return super.post<VisitorNote, never, CreateVisitorNotePayload>(
			CONFIG.ENDPOINTS.VISITOR.NOTES(organizationId, visitorId),
			payload,
			axiosConfiguration,
		);
	}
}

export const visitorApiService = new VisitorApiService(apiClient);
