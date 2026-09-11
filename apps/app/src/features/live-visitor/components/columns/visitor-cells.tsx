import type { IconName } from "@package/icons";
import {
	Avatar,
	Badge,
	cn,
	FlagImage,
	Icon,
	PopoverWrapper,
	Typography,
} from "@package/ui";
import { useRef, useState } from "react";
import type { VisitorListItem } from "../../types";
import {
	formatDuration,
	visitorDisplayName,
	visitorInitial,
	visitorLocation,
} from "../../utility";

const BROWSER_ICONS: Record<string, IconName> = {
	chrome: "chrome",
	safari: "safari",
};

const DEVICE_ICONS: Record<string, IconName> = {
	desktop: "computer",
	mobile: "smart-phone",
	tablet: "laptop",
};

export function VisitorIdentityCell({ visitor }: { visitor: VisitorListItem }) {
	const name = visitorDisplayName(visitor);
	const subline =
		visitor.isIdentified && visitor.email
			? visitor.email
			: (visitor.ipAddress ?? "Unknown IP");

	return (
		<HoverPreviewPopover title={name} description={subline} visitor={visitor}>
			<div className="flex min-w-0 items-center gap-2.5">
				<div className="relative shrink-0">
					<Avatar
						size="lg"
						fallbackText={visitorInitial(visitor)}
						className="bg-gray-200"
					/>
					<span
						className={cn(
							"absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white-base",
							visitor.isOnline ? "bg-success-400" : "bg-gray-300",
						)}
						title={visitor.isOnline ? "Online" : "Offline"}
					/>
				</div>
				<div className="flex min-w-0 flex-col">
					<Typography.T4 weight="medium" className="truncate text-gray-950">
						{name}
					</Typography.T4>
					<Typography.T6 className="truncate text-gray-500">{subline}</Typography.T6>
				</div>
			</div>
		</HoverPreviewPopover>
	);
}

function HoverPreviewPopover({
	title,
	description,
	visitor,
	children,
}: {
	title: string;
	description: string;
	visitor: VisitorListItem;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleEnter = () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
		setOpen(true);
	};

	const handleLeave = () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
		closeTimer.current = setTimeout(() => setOpen(false), 120);
	};

	const handleContentEnter = () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
		setOpen(true);
	};

	const deviceText = [visitor.device, visitor.deviceType]
		.filter(Boolean)
		.join(" · ");

	return (
		<PopoverWrapper
			open={open}
			onOpenChange={(next) => {
				if (!next) setOpen(false);
			}}
			title={title}
			description={description}
			align="start"
			sideOffset={8}
			Trigger={() => (
				<div className="inline-flex min-w-0" onClick={() => setOpen(false)}>
					{children}
				</div>
			)}
			popoverTriggerProps={{
				onMouseEnter: handleEnter,
				onMouseLeave: handleLeave,
			}}
			className="p-3"
		>
			<div
				onMouseEnter={handleContentEnter}
				onMouseLeave={handleLeave}
				className="flex min-w-56 flex-col gap-1"
			>
				<div className="flex items-center gap-1.5 pt-1">
					<Badge
						size="xs"
						radius="rounded"
						dot
						variant={visitor.isOnline ? "success" : "secondary"}
					>
						{visitor.isOnline ? "Online" : "Offline"}
					</Badge>
					{visitor.status && (
						<span className="text-xs capitalize text-gray-500">
							{visitor.status.toLowerCase()}
						</span>
					)}
				</div>
				<PopoverDetailRow
					value={visitorLocation(visitor)}
					render={() =>
						visitor.countryCode ? (
							<FlagImage
								countryCode={visitor.countryCode}
								title={visitor.country ?? undefined}
							/>
						) : undefined
					}
				/>
				{visitor.deviceType && (
					<PopoverDetailRow
						value={deviceText}
						icon={DEVICE_ICONS[visitor.deviceType]}
					/>
				)}
				{visitor.browser && (
					<PopoverDetailRow
						value={visitor.browser}
						icon={BROWSER_ICONS[visitor.browser.toLowerCase()]}
					/>
				)}
				{visitor.currentPage && (
					<PopoverDetailRow label="Page" value={visitor.currentPage} />
				)}
				<PopoverDetailRow
					label="Active"
					value={`${formatDuration(visitor.activeDuration)} · ${visitor.visitCount} visits`}
				/>
			</div>
		</PopoverWrapper>
	);
}

function PopoverDetailRow({
	label,
	value,
	icon,
	render,
}: {
	label?: string;
	value: string;
	icon?: IconName;
	render?: () => React.ReactNode;
}) {
	return (
		<div className="flex min-w-0 items-center gap-1.5">
			{icon && <Icon name={icon} size={14} className="shrink-0 text-gray-400" />}
			{render?.()}
			{label && <span className="shrink-0 text-xs text-gray-400">{label}</span>}
			<Typography.T6 className="min-w-0 truncate text-gray-700 capitalize">
				{value}
			</Typography.T6>
		</div>
	);
}

export function VisitorStatusCell({ visitor }: { visitor: VisitorListItem }) {
	return visitor.isOnline ? (
		<Badge size="xs" radius="rounded" variant="success" dot>
			Online
		</Badge>
	) : (
		<Badge size="xs" radius="rounded" variant="secondary" dot>
			Offline
		</Badge>
	);
}

export function VisitorLocationCell({ visitor }: { visitor: VisitorListItem }) {
	return (
		<div className="flex min-w-0 items-center gap-2">
			<FlagImage
				countryCode={visitor.countryCode}
				title={visitor.country ?? undefined}
			/>
			<Typography.T4 className="truncate text-gray-700">
				{visitorLocation(visitor)}
			</Typography.T4>
		</div>
	);
}

export function VisitorDeviceCell({ visitor }: { visitor: VisitorListItem }) {
	const deviceIcon = visitor.deviceType
		? DEVICE_ICONS[visitor.deviceType]
		: undefined;
	const browserIcon = visitor.browser
		? BROWSER_ICONS[visitor.browser.toLowerCase()]
		: undefined;

	return (
		<div className="flex min-w-0 items-center gap-2 text-gray-500">
			{deviceIcon && <Icon name={deviceIcon} size={14} />}
			<Typography.T4 className="truncate text-gray-700">
				{visitor.device ?? visitor.deviceType ?? "Unknown"}
			</Typography.T4>
			{browserIcon && <Icon name={browserIcon} size={14} />}
		</div>
	);
}

export function VisitorCurrentPageCell({
	visitor,
}: {
	visitor: VisitorListItem;
}) {
	if (!visitor.currentPage) {
		return <Typography.T4 className="text-gray-400">—</Typography.T4>;
	}
	return (
		<Typography.T4
			className="max-w-48 truncate text-gray-700"
			title={visitor.currentPage}
		>
			{visitor.currentPage}
		</Typography.T4>
	);
}

export function VisitorDurationCell({ visitor }: { visitor: VisitorListItem }) {
	return (
		<Typography.T4 className="text-gray-700">
			{formatDuration(visitor.activeDuration)}
		</Typography.T4>
	);
}

export function VisitorVisitCountCell({
	visitor,
}: {
	visitor: VisitorListItem;
}) {
	return (
		<Typography.T4 className="text-gray-700">{visitor.visitCount}</Typography.T4>
	);
}
