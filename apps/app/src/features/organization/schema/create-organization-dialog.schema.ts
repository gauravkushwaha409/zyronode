import { z } from "zod";

export const createOrganizationDialogSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Organization name is required")
		.max(50, "Organization name cannot exceed 50 characters"),
	website: z
		.string()
		.trim()
		.url("Enter a valid URL")
		.optional()
		.or(z.literal("")),
});

export type CreateOrganizationDialogSchema = z.infer<
	typeof createOrganizationDialogSchema
>;
