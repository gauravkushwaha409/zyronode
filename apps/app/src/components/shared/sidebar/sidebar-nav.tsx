import { cn } from "@package/ui";
import { useUnreadStatsQuery } from "@/features/default-inbox/hooks/queries";
import type { SidebarItems } from "./sidebar.types";
import { NavLink } from "./sidebar-nav-link";

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
	const { data, isSuccess } = useUnreadStatsQuery();
	const unreadCount =
		(data?.data as unknown as { conversations_with_unread?: number })
			?.conversations_with_unread ?? 0;

	// Inject badge as ReactNode via data — NavLink stays generic (no path sniffing)
	const displayData: SidebarItems = {
		UPPER: sidebarData.UPPER.map((item) =>
			item.label === "Inbox" && isSuccess && unreadCount
				? { ...item, badge: unreadCount }
				: item,
		),
		LOWER: sidebarData.LOWER,
	};

	return (
		<section
			className={cn(
				"mt-3 flex-1 px-3 flex flex-col gap-5.5 2xl:gap-11 overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-gray-300 scrollbar-track-transparent scrollbar-gutter-stable",
				collapsed && !hovered && "w-fit",
			)}
		>
			<section className="flex flex-col gap-1">
				{displayData.UPPER.map((item) => (
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
				{displayData.LOWER.map((item) => (
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
