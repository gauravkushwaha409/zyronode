import type { IconName } from "@package/icons";
import type React from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../icons";
import { Typography } from "./typography";

interface EmptyStateProps {
	title: string;
	description?: string;
	icon?: IconName;
	action?: React.ReactNode;
	className?: string;
	/** `sm` suits panels and table bodies; `md` suits full page sections. */
	size?: "sm" | "md";
}

export function EmptyState({
	title,
	description,
	icon,
	action,
	className,
	size = "md",
}: EmptyStateProps) {
	return (
		<div
			data-slot="empty-state"
			className={cn(
				"flex flex-col items-center justify-center text-center",
				size === "sm" ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14",
				className,
			)}
		>
			{icon && (
				<span
					className={cn(
						"flex items-center justify-center rounded-full bg-gray-fill-50 text-gray-400",
						size === "sm" ? "size-9" : "size-12",
					)}
				>
					<Icon name={icon} size={size === "sm" ? 18 : 22} />
				</span>
			)}
			<Typography.T3 weight="medium" className="text-gray-800">
				{title}
			</Typography.T3>
			{description && (
				<Typography.T5 className="max-w-sm text-gray-500">
					{description}
				</Typography.T5>
			)}
			{action && <div className="mt-1">{action}</div>}
		</div>
	);
}
