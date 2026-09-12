import { z } from "zod";

export const teamInvitationFormSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Enter a valid email address"),
	teamId: z.string().uuid().optional().or(z.literal("")),
	roleId: z.string().uuid().optional().or(z.literal("")),
});

export type TeamInvitationFormSchema = z.infer<typeof teamInvitationFormSchema>;
