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
import { useAdminOrganizationsQuery } from "../hooks/use-admin-organizations";
import type { AdminOrganization, OrganizationPlan } from "../types";

const PAGE_SIZE = 10;

const planVariants: Record<OrganizationPlan, BadgeProps["variant"]> = {
	FREE: "secondary",
	STARTER: "info",
	PRO: "magenta",
	ENTERPRISE: "success",
};

function formatDate(value: string) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
	}).format(new Date(value));
}

const columns: ColumnDef<AdminOrganization>[] = [
	{
		id: "name",
		header: "Organization",
		size: 260,
		cell: ({ row }) => (
			<div className="min-w-0">
				<p className="truncate font-medium text-gray-950">{row.original.name}</p>
				<p className="truncate text-gray-500">
					{row.original.website ?? "No website"}
				</p>
			</div>
		),
	},
	{
		id: "plan",
		header: "Plan",
		size: 110,
		cell: ({ row }) => (
			<Badge variant={planVariants[row.original.plan]} size="sm">
				{row.original.plan}
			</Badge>
		),
	},
	{
		id: "members",
		header: "Members",
		size: 90,
		cell: ({ row }) => row.original._count.members,
	},
	{
		id: "visitors",
		header: "Visitors",
		size: 90,
		cell: ({ row }) => row.original._count.visitors,
	},
	{
		id: "conversations",
		header: "Conversations",
		size: 120,
		cell: ({ row }) => row.original._count.conversations,
	},
	{
		id: "status",
		header: "Status",
		size: 100,
		cell: ({ row }) => (
			<Badge variant={row.original.isActive ? "success" : "alert-shade"} size="sm">
				{row.original.isActive ? "Active" : "Inactive"}
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

export function OrganizationsList() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
		return () => clearTimeout(timeout);
	}, [search]);

	const organizationsQuery = useAdminOrganizationsQuery({
		page,
		limit: PAGE_SIZE,
		search: debouncedSearch || undefined,
	});

	const items = organizationsQuery.data?.data.data.items ?? [];
	const meta = organizationsQuery.data?.data.data.meta;
	const totalPages = Math.max(meta?.totalPages ?? 1, 1);

	return (
		<div className="space-y-4 p-6">
			<div>
				<Typography.T1 weight="semibold" className="text-gray-950">
					Organizations
				</Typography.T1>
				<Typography.T3 className="mt-2 text-gray-500">
					Manage every organization on the platform.
				</Typography.T3>
			</div>

			<Input
				value={search}
				onChange={(event) => {
					setSearch(event.target.value);
					setPage(1);
				}}
				placeholder="Search by name, website, or industry"
				className="max-w-sm"
			/>

			<Table
				data={items}
				columns={columns}
				getRowId={(organization) => organization.id}
				isPending={organizationsQuery.isPending}
				isError={organizationsQuery.isError}
				emptyState={
					<Typography.T4 className="text-gray-500">
						No organizations found.
					</Typography.T4>
				}
			/>

			<TablePagination
				page={page}
				total={meta?.total ?? 0}
				totalPages={totalPages}
				onPageChange={setPage}
				itemLabel="organization"
			/>
		</div>
	);
}
