import { Badge, cn, Icon, Typography } from "@package/ui";
import { Link } from "@tanstack/react-router";
import { type SidebarItem } from "./sidebar.types";

interface NavLinkProps {
	item: SidebarItem;
	pathname: string;
	open: boolean;
	isFloating: boolean;
}

export function NavLink({ item, pathname, open, isFloating }: NavLinkProps) {
	const activePath = item.matchPath ?? item.path;
	const itemSegs = activePath.split("/").filter(Boolean);
	const pathSegs = pathname.split("/").filter(Boolean);

	const isActive =
		itemSegs.length === 0
			? pathSegs.length === 0
			: itemSegs.length <= pathSegs.length &&
				itemSegs.every((seg, i) => seg === pathSegs[i]);

	return (
		<Link
			to={item.path}
			title={!open ? item.label : undefined}
			activeOptions={{ exact: true }}
			className={cn(
				"relative h-9 flex flex-row items-center rounded-[6px]",
				"border border-transparent px-2.5 gap-2",
				!open && "px-2 gap-0",
				isFloating && "gap-2",
				isActive &&
					"border-primary-200 shadow-[0_4px_10px_hsla(0,0%,0%,0.05)] bg-white-base",
			)}
		>
			<span
				className={cn(
					"shrink-0 flex items-center justify-center size-5",
					isActive && "text-primary-500",
				)}
			>
				<Icon name={item.icon} size={20} />
			</span>
			<span
				className={cn(
					"flex flex-1 items-center justify-between gap-2 overflow-hidden whitespace-nowrap",
					open ? "max-w-40 opacity-100" : "max-w-0 opacity-0",
				)}
			>
				<Typography.T3
					weight="medium"
					className={cn("truncate text-gray-800", isActive && "text-primary-500")}
				>
					{item.label}
				</Typography.T3>
				{!!item.badge && (
					<Badge size="xs" radius="rounded" variant="secondary" className="shrink-0">
						{item.badge}
					</Badge>
				)}
			</span>
		</Link>
	);
}
