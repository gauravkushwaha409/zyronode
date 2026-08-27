import type { IconName } from "@package/icons";

export interface SidebarItem {
	label: string;
	icon: IconName;
	path: string;
	matchPath?: string;
	badge?: number;
	/** Renders the "Other Inboxes" section header immediately after this item. */
	showOtherInboxesAfter?: boolean;
}

export interface SidebarItems {
	UPPER: SidebarItem[];
	LOWER: SidebarItem[];
}
