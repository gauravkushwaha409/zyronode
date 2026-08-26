// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { InnerSidebarData } from "@/components/shared/inner-sidebar";

export const SETTINGS_SIDEBAR_DATA: InnerSidebarData[] = [
	{
		title: "Account Settings",
		icon: "accounts",
		items: [
			{
				label: "Account Information",
				href: "/$organization/settings/account-settings/account-information",
			},
			{
				label: "Security",
				href: "/$organization/settings/account-settings/security",
			},
			{
				label: "Interface Setup",
				href: "/$organization/settings/account-settings/interface-setup",
			},
		],
	},
	{
		title: "Organization Settings",
		icon: "workspace",
		items: [
			{
				label: "Organization Information",
				href: "/$organization/settings/organization-settings/organization-information",
			},
			{
				label: "Operating Hours",
				href: "/$organization/settings/organization-settings/operating-hours",
			},
			{
				label: "Setup & Integrations",
				href: "/$organization/settings/organization-settings/setup-and-integrations",
			},
		],
	},
	{
		title: "Chatboq Settings",
		icon: "chatboq-settings",
		items: [
			{
				label: "Chatboq Appearance",
				href: "/$organization/settings/chatboq-settings/chatboq-appearance",
			},
			{
				label: "Chatboq Behaviour",
				href: "/$organization/settings/chatboq-settings/chatboq-behaviour",
			},
			{
				label: "Pre-Chat Survey",
				href: "/$organization/settings/chatboq-settings/pre-chat-survey",
			},
		],
	},
	{
		title: "Team Management",
		href: "/$organization/settings/team-management",
		icon: "team",
	},
	{
		title: "Motivations & Celebrations",
		href: "/$organization/settings/motivation-celebration",
		icon: "motivations",
	},
	{
		title: "Quick Replies",
		href: "/$organization/settings/quick-replies",
		icon: "quick-reply",
	},
	{
		title: "Billing & Subscription",
		href: "/$organization/settings/billing-subscription",
		icon: "send-transcript",
	},
];
