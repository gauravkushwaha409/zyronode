import { Button, Typography } from "@package/ui";

interface TablePaginationProps {
	page: number;
	total: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	itemLabel: string;
}

export function TablePagination({
	page,
	total,
	totalPages,
	onPageChange,
	itemLabel,
}: TablePaginationProps) {
	return (
		<div className="flex items-center justify-between gap-4">
			<Typography.T4 className="text-gray-500">
				{total} {itemLabel}
				{total === 1 ? "" : "s"}
			</Typography.T4>
			<div className="flex items-center gap-2">
				<Typography.T4 className="text-gray-600">
					Page {page} of {Math.max(totalPages, 1)}
				</Typography.T4>
				<Button
					variant="secondary"
					size="xs"
					className="w-auto"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
				>
					Previous
				</Button>
				<Button
					variant="secondary"
					size="xs"
					className="w-auto"
					disabled={page >= Math.max(totalPages, 1)}
					onClick={() => onPageChange(page + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
