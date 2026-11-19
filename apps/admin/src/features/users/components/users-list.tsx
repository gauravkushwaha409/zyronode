import {
	Badge,
	type BadgeProps,
	type ColumnDef,
	Input,
	Table,
	Typography,
} from "@package/ui";
import { useEffect, useState } from "react";
import { TablePagination } from "@/components/shared/table-pagination";
import { useAdminUsersQuery } from "../hooks/use-admin-users";
import type { AdminUserRow, PlatformRole } from "../types";

const PAGE_SIZE = 10;

const roleVariants: Record<PlatformRole, BadgeProps["variant"]> = {
	NONE: "secondary",
	MANAGER: "info",
	ADMIN: "magenta",
	SUPER_ADMIN: "success",
};

function formatDate(value: string) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
	}).format(new Date(value));
}

function getDisplayName(user: AdminUserRow) {
	return (
		[user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed user"
	);
}

const columns: ColumnDef<AdminUserRow>[] = [
	{
		id: "user",
		header: "User",
		size: 260,
		cell: ({ row }) => (
			<div className="min-w-0">
				<p className="truncate font-medium text-gray-950">
					{getDisplayName(row.original)}
				</p>
				<p className="truncate text-gray-500">{row.original.email}</p>
			</div>
		),
	},
	{
		id: "platformRole",
		header: "Platform role",
		size: 130,
		cell: ({ row }) => (
			<Badge variant={roleVariants[row.original.platformRole]} size="sm">
				{row.original.platformRole.replace("_", " ")}
			</Badge>
		),
	},
	{
		id: "organizations",
		header: "Organizations",
		size: 120,
		cell: ({ row }) => row.original._count.organizations,
	},
	{
		id: "lastOrg",
		header: "Last organization",
		size: 180,
		cell: ({ row }) => row.original.lastOrg?.name ?? "—",
	},
	{
		id: "verified",
		header: "Email verified",
		size: 120,
		cell: ({ row }) => (
			<Badge
				variant={row.original.isEmailVerified ? "success" : "warning"}
				size="sm"
			>
				{row.original.isEmailVerified ? "Verified" : "Pending"}
			</Badge>
		),
	},
	{
		id: "createdAt",
		header: "Created",
		size: 130,
		cell: ({ row }) => formatDate(row.original.createdAt),
	},
];

export function UsersList() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
		return () => clearTimeout(timeout);
	}, [search]);

	const usersQuery = useAdminUsersQuery({
		page,
		limit: PAGE_SIZE,
		search: debouncedSearch || undefined,
	});

	const items = usersQuery.data?.data.data.items ?? [];
	const meta = usersQuery.data?.data.data.meta;
	const totalPages = Math.max(meta?.totalPages ?? 1, 1);

	return (
		<div className="space-y-4 p-6">
			<div>
				<Typography.T1 weight="semibold" className="text-gray-950">
					Users
				</Typography.T1>
				<Typography.T3 className="mt-2 text-gray-500">
					Browse and manage platform users.
				</Typography.T3>
			</div>

			<Input
				value={search}
				onChange={(event) => {
					setSearch(event.target.value);
					setPage(1);
				}}
				placeholder="Search by name or email"
				className="max-w-sm"
			/>

			<Table
				data={items}
				columns={columns}
				getRowId={(user) => user.id}
				isPending={usersQuery.isPending}
				isError={usersQuery.isError}
				emptyState={
					<Typography.T4 className="text-gray-500">
						No users found.
					</Typography.T4>
				}
			/>

			<TablePagination
				page={page}
				total={meta?.total ?? 0}
				totalPages={totalPages}
				onPageChange={setPage}
				itemLabel="user"
			/>
		</div>
	);
}
