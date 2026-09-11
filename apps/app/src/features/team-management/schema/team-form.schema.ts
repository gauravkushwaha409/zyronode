import { z } from "zod";

export const teamFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Team name is required")
		.max(50, "Team name cannot exceed 50 characters"),
	description: z
		.string()
		.trim()
		.max(300, "Description cannot exceed 300 characters")
		.optional()
		.or(z.literal("")),
	leaderId: z.string().uuid().optional().or(z.literal("")),
});

export type TeamFormSchema = z.infer<typeof teamFormSchema>;
