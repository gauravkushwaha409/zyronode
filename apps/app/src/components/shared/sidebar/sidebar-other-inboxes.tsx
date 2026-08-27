import { Icon, Typography } from "@package/ui";

interface SidebarOtherInboxesProps {
	open: boolean;
}

/**
 * Static section header for custom/shared inboxes. No inbox-category feature
 * exists yet, so this renders the label + add affordance only — wire it up
 * to real data once that API lands.
 */
export function SidebarOtherInboxes({ open }: SidebarOtherInboxesProps) {
	if (!open) return null;

	return (
		<div className="flex h-7 items-center justify-between px-2.5">
			<Typography.T6 weight="medium" className="text-gray-400">
				Other Inboxes
			</Typography.T6>
			<button
				type="button"
				className="flex size-5 items-center justify-center rounded-[4px] text-gray-400 hover:bg-gray-fill-50 hover:text-gray-600 cursor-pointer"
				aria-label="Add inbox"
			>
				<Icon name="plus" size={14} />
			</button>
		</div>
	);
}
