import { z } from "zod";

export const roleFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Role name is required")
		.max(50, "Role name cannot exceed 50 characters"),
	description: z
		.string()
		.trim()
		.max(300, "Description cannot exceed 300 characters")
		.optional()
		.or(z.literal("")),
	permissionIds: z
		.array(z.string().uuid())
		.min(1, "Select at least one permission"),
});

export type RoleFormSchema = z.infer<typeof roleFormSchema>;
