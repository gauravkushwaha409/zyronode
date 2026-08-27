import { cn } from "@package/ui";
import type { OrganizationList } from "@/features/organization/types";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from "./sidebar.constants";
import type { SidebarItems } from "./sidebar.types";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-nav";
import { SidebarPlanCard } from "./sidebar-plan-card";

interface SidebarPanelProps {
	open: boolean;
	isFloating: boolean;
	collapsed: boolean;
	hovered: boolean;
	pathname: string;
	sidebarData: SidebarItems;
	userData: any;
	currentOrganization?: OrganizationList.OrganizationItem;
	otherOrganizations: OrganizationList.OrganizationItem[];
	onSwitchOrganization: (organizationId: string) => void;
	onLogout: () => void;
	isLoggingOut?: boolean;
	onPin: () => void;
	onCollapse: () => void;
}

export function SidebarPanel({
	open,
	isFloating,
	collapsed,
	hovered,
	pathname,
	sidebarData,
	userData,
	currentOrganization,
	otherOrganizations,
	onSwitchOrganization,
	onLogout,
	isLoggingOut,
	onPin,
	onCollapse,
}: SidebarPanelProps) {
	return (
		<section
			style={{ width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON }}
			className={cn(
				"flex flex-col h-full relative py-3 justify-between space-y-3 overflow-hidden transition-[width] duration-300 ease-in-out",
				isFloating &&
					"absolute inset-y-0 left-0 z-40 bg-white-base border-r border-gray-200 rounded-r-[12px] shadow-[2px_0_15px_0_rgba(0,0,0,0.03)]",
			)}
		>
			<SidebarHeader
				open={open}
				hovered={hovered}
				currentOrganization={currentOrganization}
				otherOrganizations={otherOrganizations}
				onSwitchOrganization={onSwitchOrganization}
				onPin={onPin}
				onCollapse={onCollapse}
			/>
			<SidebarNav
				sidebarData={sidebarData}
				pathname={pathname}
				open={open}
				isFloating={isFloating}
				collapsed={collapsed}
				hovered={hovered}
			/>
			<SidebarPlanCard open={open} plan={currentOrganization?.plan} />
			<SidebarFooter
				open={open}
				userData={userData}
				onLogout={onLogout}
				isLoggingOut={isLoggingOut}
			/>
		</section>
	);
}
