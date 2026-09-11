import { useForm } from "@package/form";
import { type RoleFormSchema, roleFormSchema } from "../../schema";

export function useRoleForm() {
	return useForm<RoleFormSchema>({
		schema: roleFormSchema,
		defaultValues: {
			name: "",
			description: "",
			permissionIds: [],
		},
	});
}
