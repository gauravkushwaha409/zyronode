import { ADMIN_ROUTES } from "@/config";
import type { SidebarItems } from "./sidebar.types";

export const SIDEBAR_WIDTH = "220px";
export const SIDEBAR_WIDTH_ICON = "68px";

export const ADMIN_SIDEBAR_DATA: SidebarItems = {
	UPPER: [
		{
			label: "Dashboard",
			icon: "motivations",
			path: ADMIN_ROUTES.DASHBOARD,
		},
		{
			label: "Organizations",
			icon: "workspace",
			path: ADMIN_ROUTES.ORGANIZATIONS,
		},
		{
			label: "Users",
			icon: "accounts",
			path: ADMIN_ROUTES.USERS,
		},
	],
	LOWER: [
		{
			label: "Settings",
			icon: "settings",
			path: ADMIN_ROUTES.SETTINGS,
		},
	],
};
