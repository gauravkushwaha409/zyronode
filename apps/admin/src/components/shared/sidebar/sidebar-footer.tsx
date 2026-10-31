import { Avatar, cn, Typography } from "@package/ui";

interface SidebarFooterProps {
	open: boolean;
}

export function SidebarFooter({ open }: SidebarFooterProps) {
	return (
		<section className="px-3 shrink-0">
			<div className="flex w-full items-center gap-3 rounded-[6px] p-1 -m-1">
				<Avatar size="xl" fallbackType="icon" className="bg-gray-200" />
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
							Admin
						</Typography.T3>
						<Typography.T5
							weight="regular"
							className="text-gray-400 truncate max-w-32"
						>
							admin@zyronode.local
						</Typography.T5>
					</div>
				</section>
			</div>
		</section>
	);
}
