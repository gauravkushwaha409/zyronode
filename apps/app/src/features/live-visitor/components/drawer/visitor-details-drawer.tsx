import {
	Avatar,
	Badge,
	Button,
	cn,
	FlagImage,
	Icon,
	Sheet,
	SheetBody,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	Typography,
} from "@package/ui";
import { format } from "date-fns";
import { useVisitorInfoQuery } from "../../hooks";
import { useVisitorPanelsStore } from "../../store";
import type { VisitorInfo } from "../../types";
import {
	formatDuration,
	skeletonKeys,
	visitorDisplayName,
	visitorInitial,
	visitorLocation,
} from "../../utility";

interface VisitorDetailsDrawerProps {
	organizationId: string;
}

export function VisitorDetailsDrawer({
	organizationId,
}: VisitorDetailsDrawerProps) {
	const drawerVisitorId = useVisitorPanelsStore((s) => s.drawerVisitorId);
	const closeDrawer = useVisitorPanelsStore((s) => s.closeDrawer);
	const openEdit = useVisitorPanelsStore((s) => s.openEdit);
	const openAssign = useVisitorPanelsStore((s) => s.openAssign);

	const { data, isLoading } = useVisitorInfoQuery(
		organizationId,
		drawerVisitorId,
	);
	const visitor = data?.data?.data;

	return (
		<Sheet
			open={Boolean(drawerVisitorId)}
			onOpenChange={(open) => {
				if (!open) closeDrawer();
			}}
		>
			<SheetContent side="right" size="lg" className="p-0">
				<SheetHeader className="pr-12">
					<SheetTitle>Visitor details</SheetTitle>
				</SheetHeader>

				<SheetBody>
					{isLoading && (
						<div className="flex flex-col gap-3 p-4">
							{skeletonKeys(8, "detail").map((key) => (
								<div
									key={key}
									className="h-5 w-full animate-pulse rounded bg-gray-100"
								/>
							))}
						</div>
					)}
					{!isLoading && visitor && <DrawerContent visitor={visitor} />}
				</SheetBody>

				{visitor && (
					<SheetFooter>
						<Button
							variant="secondary"
							size="sm"
							className="w-auto"
							onClick={() => openAssign(visitor.id)}
						>
							Assign agent
						</Button>
						<Button size="sm" className="w-auto" onClick={() => openEdit(visitor.id)}>
							Edit details
						</Button>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}

function DrawerContent({ visitor }: { visitor: VisitorInfo }) {
	return (
		<div className="flex flex-col">
			<section className="flex items-center gap-3 border-b border-gray-border-200 p-4">
				<div className="relative shrink-0">
					<Avatar
						size="2xl"
						fallbackText={visitorInitial(visitor)}
						className="bg-gray-200"
					/>
					<span
						className={cn(
							"absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white-base",
							visitor.isOnline ? "bg-success-400" : "bg-gray-300",
						)}
					/>
				</div>
				<div className="flex min-w-0 flex-col gap-0.5">
					<Typography.T2 weight="medium" className="truncate text-gray-950">
						{visitorDisplayName(visitor)}
					</Typography.T2>
					<div className="flex items-center gap-2">
						{visitor.isOnline ? (
							<Badge size="xs" radius="rounded" variant="success" dot>
								Online
							</Badge>
						) : (
							<Badge size="xs" radius="rounded" variant="secondary" dot>
								Offline
							</Badge>
						)}
						<Badge size="xs" radius="rounded" variant="default">
							{visitor.status}
						</Badge>
					</div>
				</div>
			</section>

			<DetailSection title="Contact">
				<DetailRow icon="email" label="Email" value={visitor.email} />
				<DetailRow icon="call" label="Phone" value={visitor.phone} />
				<DetailRow
					icon="assignee"
					label="Assigned to"
					value={
						visitor.assignedAgent
							? [visitor.assignedAgent.firstName, visitor.assignedAgent.lastName]
									.filter(Boolean)
									.join(" ") || visitor.assignedAgent.email
							: null
					}
				/>
			</DetailSection>

			<DetailSection title="Session">
				<DetailRow
					icon="browser"
					label="Current page"
					value={visitor.currentPage}
				/>
				<DetailRow
					icon="time"
					label="Active for"
					value={formatDuration(visitor.activeDuration)}
				/>
				<DetailRow
					icon="refresh"
					label="Total visits"
					value={String(visitor.visitCount)}
				/>
				<DetailRow
					icon="time"
					label="Last seen"
					value={
						visitor.lastSeenAt
							? format(new Date(visitor.lastSeenAt), "dd MMM yyyy, HH:mm")
							: null
					}
				/>
				<DetailRow icon="link" label="Landed on" value={visitor.sourceUrl} />
			</DetailSection>

			<DetailSection title="Location & device">
				<div className="flex items-center gap-2 px-4 py-2">
					<FlagImage countryCode={visitor.countryCode} />
					<Typography.T4 className="text-gray-700">
						{visitorLocation(visitor)}
					</Typography.T4>
				</div>
				<DetailRow icon="gmt" label="Timezone" value={visitor.timezone} />
				<DetailRow icon="computer" label="Device" value={visitor.device} />
				<DetailRow icon="browser" label="Browser" value={visitor.browser} />
				<DetailRow icon="laptop" label="OS" value={visitor.os} />
				<DetailRow icon="location" label="IP" value={visitor.ipAddress} />
			</DetailSection>

			{visitor.pageVisits.length > 0 && (
				<DetailSection title={`Visited pages (${visitor.pageVisits.length})`}>
					<ul className="flex flex-col">
						{visitor.pageVisits.slice(0, 12).map((visit) => (
							<li
								key={visit.id}
								className="flex items-center justify-between gap-3 px-4 py-2"
							>
								<Typography.T5 className="truncate text-gray-700" title={visit.url}>
									{visit.url}
								</Typography.T5>
								<Typography.T6 className="shrink-0 tabular-nums text-gray-500">
									{formatDuration(visit.durationSeconds)}
								</Typography.T6>
							</li>
						))}
					</ul>
				</DetailSection>
			)}

			{visitor.notes.length > 0 && (
				<DetailSection title={`Notes (${visitor.notes.length})`}>
					<ul className="flex flex-col gap-2 px-4 py-2">
						{visitor.notes.map((note) => (
							<li
								key={note.id}
								className="rounded-[8px] border border-gray-border-200 bg-gray-fill-50 p-2.5"
							>
								<Typography.T5 className="whitespace-pre-wrap text-gray-800">
									{note.content}
								</Typography.T5>
								<Typography.T6 className="mt-1 block text-gray-500">
									{note.author?.email ?? "Unknown"} ·{" "}
									{format(new Date(note.createdAt), "dd MMM, HH:mm")}
								</Typography.T6>
							</li>
						))}
					</ul>
				</DetailSection>
			)}
		</div>
	);
}

function DetailSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="border-b border-gray-border-200 py-2 last:border-b-0">
			<Typography.T6
				weight="medium"
				className="block px-4 py-1.5 text-gray-400 uppercase"
			>
				{title}
			</Typography.T6>
			{children}
		</section>
	);
}

function DetailRow({
	icon,
	label,
	value,
}: {
	icon: React.ComponentProps<typeof Icon>["name"];
	label: string;
	value: string | null | undefined;
}) {
	return (
		<div className="flex items-center gap-3 px-4 py-2">
			<span className="shrink-0 text-gray-400">
				<Icon name={icon} size={14} />
			</span>
			<Typography.T5 className="w-24 shrink-0 text-gray-500">
				{label}
			</Typography.T5>
			<Typography.T5
				className="min-w-0 flex-1 truncate text-gray-800"
				title={value ?? undefined}
			>
				{value || "—"}
			</Typography.T5>
		</div>
	);
}
