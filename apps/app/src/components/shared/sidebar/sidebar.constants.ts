import { NAV_ITEMS } from "@/config/path";
import type { SidebarItems } from "./sidebar.types";

export const SIDEBAR_WIDTH = "220px";
export const SIDEBAR_WIDTH_ICON = "68px";

export const getSidebarData = (orgId: string): SidebarItems => ({
	UPPER: [
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
		{
			label: "Tickets",
			icon: "tickets",
			path: `/${orgId}${NAV_ITEMS.TICKETS}`,
		},
		{
			label: "Contacts",
			icon: "contacts",
			path: `/${orgId}${NAV_ITEMS.CONTACTS}`,
		},
		{
			label: "Lead and CRM",
			icon: "image-place-holder",
			path: `/${orgId}${NAV_ITEMS.LEAD}`,
		},
		{
			label: "Chatboq AI",
			icon: "chatboq-ai",
			path: `/${orgId}${NAV_ITEMS.CHATBOQ_AI}`,
		},
		{
			label: "Campaigns",
			icon: "campaigns",
			path: `/${orgId}${NAV_ITEMS.CAMPAIGNS}`,
		},
		{
			label: "Knowledge Hub",
			icon: "knowledge-hub",
			path: `/${orgId}${NAV_ITEMS.KNOWLEDGE_HUB}`,
		},
		{
			label: "Analytics",
			icon: "analytics",
			path: `/${orgId}${NAV_ITEMS.ANALYTICS}`,
		},
		{
			label: "Dashboard",
			icon: "motivations",
			path: `/${orgId}${NAV_ITEMS.DASHBOARD}`,
		},
	],
	LOWER: [
		{
			label: "Support Library",
			icon: "support-library",
			path: `/${orgId}${NAV_ITEMS.SUPPORT_LIBRARY}`,
		},
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
