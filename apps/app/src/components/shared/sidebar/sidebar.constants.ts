import { NAV_ITEMS } from "@/config/path";
import type { SidebarItems } from "./sidebar.types";

export const SIDEBAR_WIDTH = "220px";
export const SIDEBAR_WIDTH_ICON = "68px";

export const getSidebarData = (orgId: string): SidebarItems => ({
	UPPER: [
		{
			label: "Dashboard",
			icon: "inbox",
			path: `/${orgId}${NAV_ITEMS.DASHBOARD}`,
		},
		{
			label: "Inbox",
			icon: "inbox",
			path: `/${orgId}${NAV_ITEMS.DEFAULT_INBOX}`,
			showOtherInboxesAfter: true,
		},
		{
			label: "Tickets",
			icon: "tickets",
			path: `/${orgId}${NAV_ITEMS.TICKETS}`,
		},
		{
			label: "Visitors",
			icon: "accounts",
			path: `/${orgId}${NAV_ITEMS.VISITORS}`,
		},
	],
	LOWER: [
		{
			label: "Settings",
			icon: "settings",
			path: `/${orgId}${NAV_ITEMS.SETTINGS}`,
			matchPath: `/${orgId}/settings`,
		},
	],
});
