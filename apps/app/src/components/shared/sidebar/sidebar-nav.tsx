import { cn } from '@package/ui';
import { NavLink } from './sidebar-nav-link';
import type { SidebarItems } from './sidebar.types';

interface SidebarNavProps {
  sidebarData: SidebarItems;
  pathname: string;
  open: boolean;
  isFloating: boolean;
  collapsed: boolean;
  hovered: boolean;
}

export function SidebarNav({
  sidebarData,
  pathname,
  open,
  isFloating,
  collapsed,
  hovered,
}: SidebarNavProps) {
  return (
    <section
      className={cn(
        'mt-3 flex-1 px-3 flex flex-col gap-5.5 2xl:gap-11 overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-gray-300 scrollbar-track-transparent scrollbar-gutter-stable',
        collapsed && !hovered && 'w-fit',
      )}
    >
      <section className="flex flex-col gap-1">
        {sidebarData.UPPER.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            pathname={pathname}
            open={open}
            isFloating={isFloating}
          />
        ))}
      </section>
      <section className="flex flex-col gap-1">
        {sidebarData.LOWER.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            pathname={pathname}
            open={open}
            isFloating={isFloating}
          />
        ))}
      </section>
    </section>
  );
}
