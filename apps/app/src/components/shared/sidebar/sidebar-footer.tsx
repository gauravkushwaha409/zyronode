import {
	Avatar,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Icon,
	Typography,
} from "@package/ui";

interface SidebarFooterProps {
	open: boolean;
	userData: any;
	onLogout: () => void;
	isLoggingOut?: boolean;
}

export function SidebarFooter({
	open,
	userData,
	onLogout,
	isLoggingOut,
}: SidebarFooterProps) {
	const profile = userData?.data?.data?.profile;
	const firstName = userData?.data?.data?.firstName ?? "";
	const lastName = userData?.data?.data?.lastName ?? "";
	const email = userData?.data?.data?.email ?? "";
	const fullName =
		firstName || lastName ? `${firstName} ${lastName}`.trim() : email;

	return (
		<section className="px-3 shrink-0">
			<DropdownMenu>
				<DropdownMenuTrigger
					disabled={!open}
					className="group flex w-full items-center gap-3 rounded-[6px] p-1 -m-1 disabled:cursor-default enabled:hover:bg-gray-fill-50"
				>
					<Avatar
						key={profile}
						size="xl"
						fallbackType="icon"
						image={profile ?? undefined}
						className="bg-gray-200"
					/>
					<section
						className={cn(
							"flex flex-1 items-center gap-1 overflow-hidden whitespace-nowrap",
							open ? "max-w-40 opacity-100" : "max-w-0 opacity-0",
						)}
					>
						<div className="flex-1 flex flex-col text-start overflow-hidden">
							<Typography.T3
								weight="medium"
								className="text-gray-950 truncate max-w-32"
							>
								{fullName}
							</Typography.T3>
							<Typography.T5
								weight="regular"
								className="text-gray-400 truncate max-w-32"
							>
								{email}
							</Typography.T5>
						</div>
						<Icon
							name="arrow-up"
							size={12}
							className="shrink-0 text-gray-400 transition-transform group-data-[state=open]:rotate-180"
						/>
					</section>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" side="top" className="w-56">
					<DropdownMenuItem
						variant="danger"
						disabled={isLoggingOut}
						onSelect={onLogout}
					>
						<Icon name="logout" size={16} />
						{isLoggingOut ? "Logging out…" : "Log out"}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</section>
	);
}
