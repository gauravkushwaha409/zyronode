import {
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Icon,
	Typography,
} from "@package/ui";
import type { OrganizationList } from "@/features/organization/types";

interface SidebarHeaderProps {
	open: boolean;
	hovered: boolean;
	currentOrganization?: OrganizationList.OrganizationItem;
	otherOrganizations: OrganizationList.OrganizationItem[];
	onSwitchOrganization: (organizationId: string) => void;
	onPin: () => void;
	onCollapse: () => void;
}

function getInitial(name: string) {
	return name.trim().charAt(0).toUpperCase() || "?";
}

function OrgAvatar({ name, className }: { name: string; className?: string }) {
	return (
		<div
			className={cn(
				"flex size-8 shrink-0 items-center justify-center rounded-[6px] bg-linear-to-t from-primary-950 to-primary-500 text-white text-sm font-bold shadow-sm",
				className,
			)}
		>
			{getInitial(name)}
		</div>
	);
}

export function SidebarHeader({
	open,
	hovered,
	currentOrganization,
	otherOrganizations,
	onSwitchOrganization,
	onPin,
	onCollapse,
}: SidebarHeaderProps) {
	const orgName = currentOrganization?.name ?? "Chatboq";
	const canSwitch = open && otherOrganizations.length > 0;

	return (
		<section className="px-3">
			<section className="flex items-center gap-1">
				<DropdownMenu>
					<DropdownMenuTrigger
						disabled={!canSwitch}
						className="group flex min-w-0 flex-1 items-center gap-1 rounded-[6px] p-1 -m-1 disabled:cursor-default enabled:hover:bg-gray-fill-50"
					>
						<OrgAvatar name={orgName} />
						<div
							className={cn(
								"flex flex-1 items-center gap-1 overflow-hidden whitespace-nowrap",
								open ? "max-w-40 opacity-100" : "max-w-0 opacity-0",
							)}
						>
							<Typography.T3
								weight="medium"
								className="max-w-28 overflow-hidden text-ellipsis text-start text-gray-800"
							>
								{orgName}
							</Typography.T3>
							{otherOrganizations.length > 0 && (
								<Icon
									name="arrow-down"
									size={12}
									className="shrink-0 text-gray-400 transition-transform group-data-[state=open]:rotate-180"
								/>
							)}
						</div>
					</DropdownMenuTrigger>
					{canSwitch && (
						<DropdownMenuContent align="start" className="w-56">
							{otherOrganizations.map((org) => (
								<DropdownMenuItem
									key={org.id}
									onSelect={() => onSwitchOrganization(org.id)}
								>
									<OrgAvatar name={org.name} className="size-6 text-xs" />
									<span className="truncate">{org.name}</span>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					)}
				</DropdownMenu>

				{open && (
					<button
						type="button"
						className="flex size-6 shrink-0 items-center justify-center rounded-[6px] text-gray-400 hover:text-gray-600 cursor-pointer"
						onClick={hovered ? onPin : onCollapse}
						aria-label={hovered ? "Pin sidebar open" : "Collapse sidebar"}
					>
						<Icon name={hovered ? "sidebar-open" : "sidebar-close"} size={18} />
					</button>
				)}
			</section>
		</section>
	);
}
