import { useRouter, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useLogoutMutation, useMeQuery } from "@/features/auth/hooks";
import { useMyOrganizationsQuery } from "@/features/organization/hooks";
import {
	getSidebarData,
	SIDEBAR_WIDTH,
	SIDEBAR_WIDTH_ICON,
} from "./sidebar.constants";
import { SidebarPanel } from "./sidebar-panel";

export function Sidebar() {
	const [collapsed, setCollapsed] = useState(true);
	const [hovered, setHovered] = useState(false);

	const router = useRouter();
	const { data } = useMeQuery();
	const { data: organizationsData } = useMyOrganizationsQuery();
	const logoutMutation = useLogoutMutation();

	const open = !collapsed || hovered;
	const isFloating = collapsed && hovered;

	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	const orgId = pathname.split("/")[1] ?? "";
	const sidebarData = getSidebarData(orgId);

	const organizations = organizationsData?.data?.data ?? [];
	const currentOrganization = organizations.find((org) => org.id === orgId);
	const otherOrganizations = organizations.filter((org) => org.id !== orgId);

	const handleSwitchOrganization = (organizationId: string) => {
		router.navigate({
			to: "/$organization/dashboard",
			params: { organization: organizationId },
		});
	};

	const handleLogout = () => {
		logoutMutation.mutate(undefined, {
			onSuccess: () => router.navigate({ to: "/auth/login" }),
		});
	};

	return (
		<section
			aria-hidden={collapsed && !hovered}
			style={{
				width: collapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH,
				flexShrink: 0,
			}}
			className="transition-[width] duration-300 ease-in-out relative h-full"
			onMouseEnter={() => {
				if (collapsed) setHovered(true);
			}}
			onMouseLeave={() => {
				if (collapsed) setHovered(false);
			}}
		>
			<SidebarPanel
				open={open}
				isFloating={isFloating}
				collapsed={collapsed}
				hovered={hovered}
				pathname={pathname}
				sidebarData={sidebarData}
				userData={data}
				currentOrganization={currentOrganization}
				otherOrganizations={otherOrganizations}
				onSwitchOrganization={handleSwitchOrganization}
				onLogout={handleLogout}
				isLoggingOut={logoutMutation.isPending}
				onPin={() => {
					setCollapsed(false);
					setHovered(false);
				}}
				onCollapse={() => setCollapsed(true)}
			/>
		</section>
	);
}
