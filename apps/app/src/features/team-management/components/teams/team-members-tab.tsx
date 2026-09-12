import type { ColumnDef } from "@package/ui";
import { Avatar, Badge, SectionHeader, Typography } from "@package/ui";
import { Table } from "@/components";
import { useOrganizationMembersQuery } from "../../hooks";
import type { OrganizationMemberItem } from "../../hooks/query/use-organization-members.query";

interface TeamMembersTabProps {
	organizationId: string;
}

const displayName = (u: {
	firstName: string | null;
	lastName: string | null;
	email: string;
}) => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;

export function TeamMembersTab({ organizationId }: TeamMembersTabProps) {
	const membersQuery = useOrganizationMembersQuery(organizationId);
	const members = membersQuery.data?.data.data ?? [];

	const columns: ColumnDef<OrganizationMemberItem>[] = [
		{
			id: "name",
			header: "Name",
			size: 240,
			cell: ({ row }) => {
				const { user } = row.original;
				return (
					<div className="flex min-w-0 items-center gap-3">
						<Avatar fallbackText={displayName(user)} size="sm" className="border" />
						<Typography.T3 weight="semibold" className="truncate text-gray-950">
							{displayName(user)}
						</Typography.T3>
					</div>
				);
			},
		},
		{
			id: "email",
			header: "Email",
			cell: ({ row }) => (
				<Badge size="xs" variant="info">
					{row.original.user.email}
				</Badge>
			),
		},
		{
			id: "role",
			header: "Role",
			cell: ({ row }) => (
				<Typography.T3 weight="medium" className="text-gray-950 capitalize">
					{row.original.role?.name ?? "—"}
				</Typography.T3>
			),
		},
		{
			id: "team",
			header: "Team",
			cell: ({ row }) => {
				const { team } = row.original;
				if (!team)
					return <Typography.T6 className="text-gray-500">—</Typography.T6>;
				return (
					<Badge dot dotVariant="info" size="xs">
						{team.name}
					</Badge>
				);
			},
		},
		{
			id: "joinedAt",
			header: "Joined",
			cell: ({ row }) => (
				<Typography.T6 className="text-gray-500">
					{new Date(row.original.joinedAt).toLocaleDateString()}
				</Typography.T6>
			),
		},
	];

	return (
		<section className="space-y-4">
			<SectionHeader heading="Members" description="All workspace members." />
			<Table
				data={members}
				columns={columns}
				getRowId={(member) => member.user.id}
				isPending={membersQuery.isLoading}
				isError={membersQuery.isError}
				emptyState={
					<Typography.T4 className="text-gray-500">
						No members in this organization yet.
					</Typography.T4>
				}
			/>
		</section>
	);
}
