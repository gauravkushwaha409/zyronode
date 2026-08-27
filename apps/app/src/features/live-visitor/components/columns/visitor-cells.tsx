import type { IconName } from "@package/icons";
import { Avatar, Badge, cn, FlagImage, Icon, Typography } from "@package/ui";
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
	return (
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
					{visitorDisplayName(visitor)}
				</Typography.T4>
				<Typography.T6 className="truncate text-gray-500">
					{visitor.isIdentified && visitor.email
						? visitor.email
						: (visitor.ipAddress ?? "Unknown IP")}
				</Typography.T6>
			</div>
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
