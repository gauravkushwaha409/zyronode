import { useMutation } from "@package/tanstack-react-query";
import { organizationApiService } from "../../services";
import type { APIError } from "@package/api-client";
import type { CreateOrganizationTypes } from "../../types";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@package/ui";

export function useCreateOrganizationMutation() {    
    const navigate = useNavigate();
    return useMutation<
        CreateOrganizationTypes.CreateOrganizationMutationResponse, 
        APIError, 
        CreateOrganizationTypes.CreateOrganizationPayload
    >(
        (data) => organizationApiService.create(data),
        {
            onSuccess: (data) => {
                toast.success("Organization created successfully");
                navigate({to: '/$organization/dashboard', params: {organization: data?.data?.data?.id}});
            },
            onError: (error) => {
                console.error("Failed to create organization", error);
                toast.error("Failed to create organization");
            },
        }
    );
}