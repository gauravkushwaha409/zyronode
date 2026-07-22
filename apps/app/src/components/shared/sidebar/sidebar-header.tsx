import { Typography } from '@package/ui';
import { cn } from '@package/ui';

interface SidebarHeaderProps {
  open: boolean;
  collapsed: boolean;
  hovered: boolean;
  onPin: () => void;
  onCollapse: () => void;
}

function PinIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.562.562 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}

function SidebarCloseIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}

export function SidebarHeader({
  open,
  collapsed,
  hovered,
  onPin,
  onCollapse,
}: SidebarHeaderProps) {
  return (
    <section className="px-3">
      <section className="flex justify-between gap-1">
        <section className="flex items-center w-full gap-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[6px] bg-linear-to-t from-primary-950 to-primary-500 text-white text-sm font-bold shadow-sm">
            C
          </div>
          <div
            className={cn(
              'flex-1 overflow-hidden whitespace-nowrap',
              open ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0',
            )}
          >
            <Typography.T3 className="font-medium text-start max-w-22.5 overflow-hidden line-clamp-1">
              Chat App
            </Typography.T3>
          </div>
        </section>

        <div className="flex items-center gap-1 ml-auto shrink-0">
          {hovered && (
            <button
              className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"
              type="button"
              onClick={onPin}
            >
              <PinIcon />
            </button>
          )}
          {!collapsed && (
            <button
              type="button"
              className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={onCollapse}
            >
              <SidebarCloseIcon />
            </button>
          )}
        </div>
      </section>
    </section>
  );
}
