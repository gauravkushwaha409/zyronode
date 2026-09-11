import type { ColumnDef } from "@package/ui";
import { Avatar, Button, DialogWrapper, Typography, toast } from "@package/ui";
import { useState } from "react";
import { Table } from "@/components";
import {
	useAddTeamMembersMutation,
	useRemoveTeamMemberMutation,
} from "../../hooks";
import type { OrganizationMemberItem } from "../../hooks/query/use-organization-members.query";
import type { Team } from "../../types";

interface TeamMembersDialogProps {
	open: boolean;
	team: Team.Item | null;
	members: OrganizationMemberItem[];
	organizationId: string;
	onOpenChange: (open: boolean) => void;
}

const displayName = (u: {
	firstName: string | null;
	lastName: string | null;
	email: string;
}) => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;

export function TeamMembersDialog({
	open,
	team,
	members,
	organizationId,
	onOpenChange,
}: TeamMembersDialogProps) {
	const teamId = team?.id ?? "";
	const addMutation = useAddTeamMembersMutation(organizationId, teamId);
	const removeMutation = useRemoveTeamMemberMutation(organizationId, teamId);

	const [addingId, setAddingId] = useState<string | null>(null);
	const [removingId, setRemovingId] = useState<string | null>(null);

	if (!team) return null;

	const currentMemberIds = new Set(team.members.map((m) => m.id));
	const availableMembers = members.filter(
		(m) => !currentMemberIds.has(m.user.id),
	);

	const currentColumns: ColumnDef<Team.Item["members"][number]>[] = [
		{
			id: "member",
			header: "Member",
			cell: ({ row }) => {
				const member = row.original;
				return (
					<div className="flex items-center gap-3">
						<Avatar fallbackText={displayName(member)} size="sm" className="border" />
						<div className="flex flex-col">
							<Typography.T3 weight="medium" className="text-gray-950">
								{displayName(member)}
							</Typography.T3>
							<Typography.T6 className="text-gray-500">{member.email}</Typography.T6>
						</div>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "",
			size: 120,
			cell: ({ row }) => {
				const member = row.original;
				return (
					<div className="flex justify-end">
						<Button
							size="xs"
							variant="alert"
							isPending={removingId === member.id}
							pendingText="Removing..."
							disabled={removeMutation.isPending}
							onClick={() => {
								setRemovingId(member.id);
								removeMutation.mutate(member.id, {
									onSuccess: () => {
										toast.success("Member removed from team");
										setRemovingId(null);
									},
									onError: () => {
										toast.error("Could not remove member");
										setRemovingId(null);
									},
								});
							}}
						>
							Remove
						</Button>
					</div>
				);
			},
		},
	];

	const availableColumns: ColumnDef<OrganizationMemberItem>[] = [
		{
			id: "member",
			header: "Available member",
			cell: ({ row }) => {
				const m = row.original.user;
				return (
					<div className="flex items-center gap-3">
						<Avatar fallbackText={displayName(m)} size="sm" className="border" />
						<div className="flex flex-col">
							<Typography.T3 weight="medium" className="text-gray-950">
								{displayName(m)}
							</Typography.T3>
							<Typography.T6 className="text-gray-500">{m.email}</Typography.T6>
						</div>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "",
			size: 110,
			cell: ({ row }) => {
				const memberId = row.original.user.id;
				return (
					<div className="flex justify-end">
						<Button
							size="xs"
							variant="outline"
							isPending={addingId === memberId}
							pendingText="Adding..."
							disabled={addMutation.isPending}
							onClick={() => {
								setAddingId(memberId);
								addMutation.mutate(
									{ memberIds: [memberId] },
									{
										onSuccess: () => {
											toast.success("Member added to team");
											setAddingId(null);
										},
										onError: () => {
											toast.error("Could not add member");
											setAddingId(null);
										},
									},
								);
							}}
						>
							Add
						</Button>
					</div>
				);
			},
		},
	];

	return (
		<DialogWrapper
			open={open}
			onOpenChange={onOpenChange}
			title={`Manage members — ${team.name}`}
			size="xl"
			description="Add or remove organization members from this team."
		>
			<div className="space-y-5">
				<div className="space-y-2">
					<Typography.T3 weight="semibold" className="text-gray-950">
						Team members ({team.members.length})
					</Typography.T3>
					<Table
						data={team.members}
						columns={currentColumns}
						getRowId={(member) => member.id}
						emptyState={
							<Typography.T4 className="text-gray-500">
								No members in this team yet.
							</Typography.T4>
						}
					/>
				</div>
				<div className="space-y-2">
					<Typography.T3 weight="semibold" className="text-gray-950">
						Add members ({availableMembers.length} available)
					</Typography.T3>
					<Table
						data={availableMembers}
						columns={availableColumns}
						getRowId={(m) => m.user.id}
						emptyState={
							<Typography.T4 className="text-gray-500">
								All organization members are already in this team.
							</Typography.T4>
						}
					/>
				</div>
			</div>
		</DialogWrapper>
	);
}
