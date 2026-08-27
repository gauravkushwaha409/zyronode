import { Button, cn, Icon, Input, Typography } from "@package/ui";
import { useVisitorCountryOptionsQuery } from "../../hooks";
import type { VisitorDeviceType, VisitorListParams } from "../../types";

interface VisitorTableFilterProps {
	organizationId: string;
	filters: VisitorListParams;
	onChange: (next: VisitorListParams) => void;
	totalCount?: number;
}

const DEVICE_TYPES: Array<{ label: string; value: VisitorDeviceType }> = [
	{ label: "Desktop", value: "desktop" },
	{ label: "Mobile", value: "mobile" },
	{ label: "Tablet", value: "tablet" },
];

const PRESENCE = [
	{ label: "Online", value: true },
	{ label: "Offline", value: false },
];

export function VisitorTableFilter({
	organizationId,
	filters,
	onChange,
	totalCount,
}: VisitorTableFilterProps) {
	const { data: countryData } = useVisitorCountryOptionsQuery(organizationId);
	const countries = countryData?.data?.data ?? [];

	// changing any filter has to drop the cursor, or page 2 of the old
	// filter set would be requested against the new one
	const setFilter = (patch: Partial<VisitorListParams>) =>
		onChange({ ...filters, ...patch, cursor: undefined });

	const hasActiveFilter =
		filters.country !== undefined ||
		filters.deviceType !== undefined ||
		filters.isOnline !== undefined ||
		!!filters.search;

	return (
		<div className="flex flex-wrap items-center gap-2 border-b border-gray-border-200 px-4 py-3">
			<div className="relative">
				<span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
					<Icon name="main-search" size={14} />
				</span>
				<Input
					value={filters.search ?? ""}
					onChange={(event) =>
						setFilter({ search: event.target.value || undefined })
					}
					placeholder="Search name, email or IP"
					className="h-9 w-64 pl-9 typo-t4"
				/>
			</div>

			<FilterGroup>
				{PRESENCE.map((option) => (
					<FilterChip
						key={option.label}
						active={filters.isOnline === option.value}
						onClick={() =>
							setFilter({
								isOnline: filters.isOnline === option.value ? undefined : option.value,
							})
						}
					>
						{option.label}
					</FilterChip>
				))}
			</FilterGroup>

			<FilterGroup>
				{DEVICE_TYPES.map((option) => (
					<FilterChip
						key={option.value}
						active={filters.deviceType === option.value}
						onClick={() =>
							setFilter({
								deviceType:
									filters.deviceType === option.value ? undefined : option.value,
							})
						}
					>
						{option.label}
					</FilterChip>
				))}
			</FilterGroup>

			{countries.length > 0 && (
				<select
					value={filters.country ?? ""}
					onChange={(event) =>
						setFilter({ country: event.target.value || undefined })
					}
					className="h-9 rounded-[6px] border border-gray-border-200 bg-white-base px-2 typo-t4 text-gray-700 outline-none focus:border-primary-500"
					aria-label="Filter by country"
				>
					<option value="">All countries</option>
					{countries.map((option) => (
						<option key={option.country} value={option.country ?? ""}>
							{option.country}
						</option>
					))}
				</select>
			)}

			<div className="ml-auto flex items-center gap-3">
				{typeof totalCount === "number" && (
					<Typography.T5 className="text-gray-500">
						{totalCount} visitor{totalCount === 1 ? "" : "s"}
					</Typography.T5>
				)}
				{hasActiveFilter && (
					<Button
						variant="ghost"
						size="xs"
						className="w-auto"
						onClick={() => onChange({ limit: filters.limit })}
					>
						Clear
					</Button>
				)}
			</div>
		</div>
	);
}

function FilterGroup({ children }: { children: React.ReactNode }) {
	return <div className="flex items-center gap-1">{children}</div>;
}

function FilterChip({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"h-9 cursor-pointer rounded-[6px] border px-2.5 typo-t4 font-medium transition-colors",
				active
					? "border-primary-200 bg-primary-50 text-primary-500"
					: "border-gray-border-200 text-gray-700 hover:bg-gray-fill-50",
			)}
		>
			{children}
		</button>
	);
}
