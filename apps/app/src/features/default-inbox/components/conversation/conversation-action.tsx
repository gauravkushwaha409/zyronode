import { Button, DropdownWrapper, useDropdownWrapper } from "@package/ui";
import { useState } from "react";

export function ConversationAction({
	triggerIconProps,
	conversationId,
	open: controlledOpen,
	onOpenChange: controlledSetOpen,
}: {
	triggerIconProps?: Pick<
		React.ComponentProps<typeof Button>,
		"size" | "icon" | "className"
	>;
	conversationId?: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const [isSnoozed] = useState(false);
	const [isBanned] = useState(false);
	const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);

	const internalDropdown = useDropdownWrapper({
		items: [
			{
				label: isSnoozed ? "Unsnooze" : "Snooze",
				value: "snooze",
				leftIcon: { name: "time" },
				onClick: () => setIsSnoozeOpen((v) => !v),
			},
			{
				label: isBanned ? "Unban Visitor" : "Ban Visitor",
				value: "ban-ip",
				leftIcon: { name: "ban-visitor" },
				onClick: () => {},
			},
			{
				label: "Move to inbox",
				value: "move-to-inbox",
				leftIcon: { name: "inbox" },
				onClick: () => {},
			},
		],
	});

	// Allow parent (e.g. list item whole-row hover) to control open state
	const dropdown =
		controlledOpen !== undefined
			? {
					...internalDropdown,
					open: controlledOpen,
					setOpen: controlledSetOpen ?? internalDropdown.setOpen,
				}
			: internalDropdown;

	// conversationId is available for wiring mutations without duplicating logic
	void conversationId;

	return (
		<div className="relative">
			<DropdownWrapper
				dropdown={dropdown}
				TriggerButton={(props) => {
					const { className, ...restProps } = props ?? {};
					return (
						<Button
							icon={triggerIconProps?.icon || "vertical-3-dot-menu"}
							variant="ghost"
							size={triggerIconProps?.size || "icon-lg"}
							className={triggerIconProps?.className as string | undefined}
							{...restProps}
						/>
					);
				}}
			/>
			{isSnoozeOpen && (
				<div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border bg-white p-4 shadow-lg">
					<p className="typo-t3 font-medium">Snooze conversation</p>
					<p className="typo-t5 text-gray-500 mt-1">Pick duration and confirm.</p>
					<div className="flex justify-end gap-2 mt-3">
						<Button
							variant="secondary"
							size="xs"
							onClick={() => setIsSnoozeOpen(false)}
						>
							Cancel
						</Button>
						<Button size="xs" onClick={() => setIsSnoozeOpen(false)}>
							Confirm
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

// Back-compat alias — will be removed after migration
export const ConversationHeaderAction = ConversationAction;
