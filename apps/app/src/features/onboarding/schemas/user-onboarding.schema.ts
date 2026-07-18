import { z } from "zod";

export const userOnboardingSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		theme: z.enum(["light", "dark"]),
		discoverSource: z.string().optional(),
		otherSource: z.string().trim().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.discoverSource === "Other" && !data.otherSource?.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["otherSource"],
				message: "Please tell us how you discovered us",
			});
		}
	});

export type UserOnboardingSchema = z.infer<typeof userOnboardingSchema>;
