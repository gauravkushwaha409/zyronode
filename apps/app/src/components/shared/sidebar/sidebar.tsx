import { useMeQuery } from '@/features/auth/hooks';
import { useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { SidebarPanel } from './sidebar-panel';
import { getSidebarData, SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from './sidebar.constants';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  const { data } = useMeQuery();

  const open = !collapsed || hovered;
  const isFloating = collapsed && hovered;

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const orgId = pathname.split('/')[1] ?? '';
  const sidebarData = getSidebarData(orgId);

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
        onPin={() => {
          setCollapsed(false);
          setHovered(false);
        }}
        onCollapse={() => setCollapsed(true)}
      />
    </section>
  );
}
