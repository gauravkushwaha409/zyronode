import { Button, cn, EmptyState, Typography } from "@package/ui";
import { useState } from "react";
import { useVisitorListQuery } from "../../hooks";
import { useVisitorPanelsStore } from "../../store";
import type { VisitorListItem, VisitorListParams } from "../../types";
import { skeletonKeys } from "../../utility";
import { VISITOR_COLUMNS } from "../columns";
import { VisitorTableFilter } from "../filter";

interface OverviewProps {
	organizationId: string;
}

const PAGE_SIZE = 25;

export function Overview({ organizationId }: OverviewProps) {
	const [filters, setFilters] = useState<VisitorListParams>({
		limit: PAGE_SIZE,
	});
	// cursors we have walked through, so "Load more" can append pages
	const [cursors, setCursors] = useState<string[]>([]);

	const activeCursor = cursors.at(-1);
	const { data, isLoading, isError, error } = useVisitorListQuery(
		organizationId,
		activeCursor ? { ...filters, cursor: activeCursor } : filters,
	);

	const page = data?.data?.data;
	const visitors = page?.data ?? [];
	const openDrawer = useVisitorPanelsStore((s) => s.openDrawer);

	const handleFilterChange = (next: VisitorListParams) => {
		setCursors([]);
		setFilters(next);
	};

	return (
		<div className="overflow-hidden rounded-[12px] border border-gray-border-200 bg-white-base">
			<VisitorTableFilter
				organizationId={organizationId}
				filters={filters}
				onChange={handleFilterChange}
				totalCount={page?.total}
			/>

			<div className="overflow-x-auto">
				<table className="w-full border-collapse">
					<thead>
						<tr className="border-b border-gray-border-200 bg-gray-fill-50">
							{VISITOR_COLUMNS.map((column) => (
								<th
									key={column.id}
									scope="col"
									className={cn(
										"px-4 py-2.5 text-left typo-t6 font-medium text-gray-500",
										column.className,
									)}
								>
									{column.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{isLoading &&
							skeletonKeys(6, "row").map((rowKey) => (
								<tr key={rowKey} className="border-b border-gray-border-100">
									{VISITOR_COLUMNS.map((column) => (
										<td key={column.id} className="px-4 py-3">
											<div className="h-4 w-full animate-pulse rounded bg-gray-100" />
										</td>
									))}
								</tr>
							))}

						{!isLoading &&
							visitors.map((visitor: VisitorListItem) => (
								<tr
									key={visitor.id}
									onClick={() => openDrawer(visitor.id)}
									className="cursor-pointer border-b border-gray-border-100 transition-colors last:border-b-0 hover:bg-gray-fill-50"
								>
									{VISITOR_COLUMNS.map((column) => (
										<td
											key={column.id}
											className={cn("px-4 py-3 align-middle", column.className)}
										>
											{column.cell(visitor)}
										</td>
									))}
								</tr>
							))}
					</tbody>
				</table>
			</div>

			{!isLoading && isError && (
				<EmptyState
					size="sm"
					icon="alert"
					title="Could not load visitors"
					description={error?.message ?? "Please try again."}
				/>
			)}

			{!isLoading && !isError && visitors.length === 0 && (
				<EmptyState
					size="sm"
					icon="accounts"
					title="No visitors yet"
					description="Visitors appear here as soon as the chat widget is live on your site."
				/>
			)}

			{page?.hasMore && page.nextCursor && (
				<div className="flex items-center justify-center border-t border-gray-border-200 px-4 py-3">
					<Button
						variant="secondary"
						size="sm"
						className="w-auto"
						onClick={() => setCursors((prev) => [...prev, page.nextCursor as string])}
					>
						Load more
					</Button>
				</div>
			)}

			{cursors.length > 0 && (
				<div className="flex items-center justify-between border-t border-gray-border-200 px-4 py-2">
					<Typography.T5 className="text-gray-500">
						Page {cursors.length + 1}
					</Typography.T5>
					<Button
						variant="ghost"
						size="xs"
						className="w-auto"
						onClick={() => setCursors((prev) => prev.slice(0, -1))}
					>
						Previous
					</Button>
				</div>
			)}
		</div>
	);
}
