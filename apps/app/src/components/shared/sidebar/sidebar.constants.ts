import { NAV_ITEMS } from "@/config/path";
import type { SidebarItems } from "./sidebar.types";

export const SIDEBAR_WIDTH = "220px";
export const SIDEBAR_WIDTH_ICON = "68px";

export const getSidebarData = (orgId: string): SidebarItems => ({
	UPPER: [
		{
			label: "Dashboard",
			icon: "motivations",
			path: `/${orgId}${NAV_ITEMS.DASHBOARD}`,
		},
		{
			label: "Inbox",
			icon: "inbox",
			path: `/${orgId}${NAV_ITEMS.DEFAULT_INBOX}`,
			showOtherInboxesAfter: true,
		},
		{
			label: "Live Visitor",
			icon: "ban-visitor",
			path: `/${orgId}${NAV_ITEMS.LIVE_VISITOR}`,
		},
	],
	LOWER: [
		{
			label: "Plugins",
			icon: "plugins",
			path: `/${orgId}${NAV_ITEMS.PLUGINS}`,
		},
		{
			label: "Settings",
			icon: "settings",
			path: `/${orgId}${NAV_ITEMS.SETTINGS}`,
			matchPath: `/${orgId}/settings`,
		},
	],
});
