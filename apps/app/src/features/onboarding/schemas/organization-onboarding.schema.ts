import { z } from "zod";

const baseSchema = z.object({
	step: z.number().default(1),
});

const step1 = z.object({
	name: z.string().min(1, "organization name is required"),
	domain: z
		.string()
		.min(1, "domain is required")
		.regex(
			/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
			"Please enter a valid domain (e.g., company.com)",
		),
	description: z.string().optional(),
	onboarding: z.object({
		size_range: z.string().optional(),
		industry: z.string().optional(),
		use_case: z.array(z.string()).optional(),
		previous_tool: z.string().optional(),
	}),
});

export const step2 = z.object({
	logo: z.string().optional(),
});

export const organizationOnboardingSchema = baseSchema
	.extend(step1.shape)
	.extend(step2.shape);

export type OrganizationOnboardingSchema = z.infer<
	typeof organizationOnboardingSchema
>;
