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
		],
	},
	{
		title: "Organization Settings",
		icon: "workspace",
		items: [
			{
				label: "Organization Information",
				href: "/$organization/settings/organization-settings/organization-information",
			}
		],
	},
	{
		title: "Team Management",
		href: "/$organization/settings/team-management",
		icon: "team",
	},
];
