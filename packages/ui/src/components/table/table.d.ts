import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table";
import type React from "react";

interface TableProps<T> {
	data: T[];
	columns: ColumnDef<T>[];
	getRowId?: (row: T, index: number) => string;
	getRowClassName?: (row: T) => string;
	tableWrapperProps?: React.ComponentProps<"div">;
	tableProps?: React.ComponentProps<"table">;
	theadProps?: React.ComponentProps<"thead">;
	tdProps?: React.ComponentProps<"td">;
	thProps?: React.ComponentProps<"td">;
	trHeaderProps?: React.ComponentProps<"tr">;
	trBodyProps?: React.ComponentProps<"tr">;
	isPending?: boolean;
	isError?: boolean;
	isSuccess?: boolean;
	rowSelection?: RowSelectionState;
	onRowSelectionChange?: (
		newState: RowSelectionState,
		selectedRows: T[],
	) => void;
}
export declare function BaseTable<T>({
	data,
	columns,
	getRowId,
	getRowClassName,
	tableWrapperProps,
	tableProps,
	theadProps,
	tdProps,
	trBodyProps,
	trHeaderProps,
	thProps,
	rowSelection,
	onRowSelectionChange,
	isPending,
	isError,
	isSuccess,
}: TableProps<T>): import("react/jsx-runtime").JSX.Element;
