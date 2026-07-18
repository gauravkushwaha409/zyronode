import type { OnboardingStep } from "../types";

export const ONBOARDING_STEPS: OnboardingStep[] = [
	{
		heading: "Turn Anonymous Visitors Into Actionable Insights",
		description:
			"Use our smart customer insights panel to turn anonymous visitors into qualified leads with actionable context.",
		image: "/images/verify/onboarding/onboarding-illustration-1.svg",
		imageAlt: "illustration-1",
		containerClassName: "pr-8 2xl:pr-11",
		imageClassName: "object-top",
	},
	{
		heading: "Manage Every Lead From One Smart Inbox",
		description:
			"AI-powered conversations built to boost team productivity, improve response time, and help you close more leads faster.",
		image: "/images/verify/onboarding/onboarding-illustration-2.svg",
		imageAlt: "illustration-2",
		containerClassName: "",
		imageClassName: "object-left",
	},
];

export const ONBOARDING_FLOW = [
	{
		type: "user",
		sidebarStep: 1,
	},
	{
		type: "organization",
		step: 1,
		sidebarStep: 1,
	},
	{
		type: "organization",
		step: 2,
		sidebarStep: 2,
	},
	{
		type: "organization",
		step: 3,
		sidebarStep: 2,
	},
] as const;
