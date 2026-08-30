import { useForm } from "@package/form";
import {
	type CreateOrganizationDialogSchema,
	createOrganizationDialogSchema,
} from "../../schema";

export function useCreateOrganizationDialogForm() {
	return useForm<CreateOrganizationDialogSchema>({
		schema: createOrganizationDialogSchema,
		defaultValues: {
			name: "",
			website: "",
		},
	});
}
