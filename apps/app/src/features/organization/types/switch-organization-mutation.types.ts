import type { APIError, ApiResponse } from "@package/api-client";
import type { OrganizationResponseData } from "./organization-mutation.types";

export type SwitchOrganizationResponseData = OrganizationResponseData;

export type SwitchOrganizationAxiosResponse =
	ApiResponse<SwitchOrganizationResponseData>;
export type SwitchOrganizationErrorResponse = APIError;
