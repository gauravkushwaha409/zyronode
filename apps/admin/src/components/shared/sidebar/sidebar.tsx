import { useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
	ADMIN_SIDEBAR_DATA,
	SIDEBAR_WIDTH,
	SIDEBAR_WIDTH_ICON,
} from "./sidebar.constants";
import { SidebarPanel } from "./sidebar-panel";

export function Sidebar() {
	const [collapsed, setCollapsed] = useState(true);
	const [hovered, setHovered] = useState(false);

	const open = !collapsed || hovered;
	const isFloating = collapsed && hovered;

	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

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
				sidebarData={ADMIN_SIDEBAR_DATA}
				onPin={() => {
					setCollapsed(false);
					setHovered(false);
				}}
				onCollapse={() => setCollapsed(true)}
			/>
		</section>
	);
}
