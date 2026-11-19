import type { IconName } from "@package/icons";

export interface SidebarItem {
	label: string;
	icon: IconName;
	path: string;
	matchPath?: string;
}

export interface SidebarItems {
	UPPER: SidebarItem[];
	LOWER: SidebarItem[];
}
