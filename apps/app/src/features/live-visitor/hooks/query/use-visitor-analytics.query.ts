import type { APIError, ApiResponse } from "@package/api-client";
import { useQuery } from "@package/query";
import { CONFIG } from "@/config";
import { visitorApiService } from "../../services";
import type {
	VisitorByCountryData,
	VisitorCountryOption,
	VisitorStatCards,
	VisitorTopPagesData,
} from "../../types";

export function useVisitorStatCardsQuery(organizationId: string) {
	return useQuery<ApiResponse<VisitorStatCards>, APIError>(
		CONFIG.QUERY_KEY.VISITOR.STAT_CARDS(organizationId),
		() => visitorApiService.statCards(organizationId),
		undefined,
		{ enabled: Boolean(organizationId), staleTime: 0, refetchOnMount: true },
	);
}

export function useVisitorByCountryQuery(organizationId: string) {
	return useQuery<ApiResponse<VisitorByCountryData>, APIError>(
		CONFIG.QUERY_KEY.VISITOR.BY_COUNTRY(organizationId),
		() => visitorApiService.byCountry(organizationId),
		undefined,
		{ enabled: Boolean(organizationId), staleTime: 0, refetchOnMount: true },
	);
}

export function useVisitorTopPagesQuery(organizationId: string) {
	return useQuery<ApiResponse<VisitorTopPagesData>, APIError>(
		CONFIG.QUERY_KEY.VISITOR.TOP_PAGES(organizationId),
		() => visitorApiService.topPages(organizationId),
		undefined,
		{ enabled: Boolean(organizationId), staleTime: 0, refetchOnMount: true },
	);
}

/** Country filter options - changes rarely, so the shared staleTime is fine. */
export function useVisitorCountryOptionsQuery(organizationId: string) {
	return useQuery<ApiResponse<VisitorCountryOption[]>, APIError>(
		CONFIG.QUERY_KEY.VISITOR.COUNTRY_OPTIONS(organizationId),
		() => visitorApiService.countryOptions(organizationId),
		undefined,
		{ enabled: Boolean(organizationId) },
	);
}
