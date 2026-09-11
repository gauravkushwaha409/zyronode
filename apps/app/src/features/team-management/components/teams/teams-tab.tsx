import type { ColumnDef } from "@package/ui";
import {
	Avatar,
	AvatarGroup,
	Button,
	ConfirmationDialog,
	SectionHeader,
	Typography,
	toast,
} from "@package/ui";
import { useState } from "react";
import { Table } from "@/components";
import {
	useCreateTeamMutation,
	useDeleteTeamMutation,
	useOrganizationMembersQuery,
	useTeamsQuery,
	useUpdateTeamMutation,
} from "../../hooks";
import type { Team, TeamForm } from "../../types";
import { TeamFormDialog } from "./team-form-dialog";

interface TeamsTabProps {
	organizationId: string;
}

interface DialogState {
	mode: TeamForm.Mode;
	team?: Team.Item;
}

export function TeamsTab({ organizationId }: TeamsTabProps) {
	const teamsQuery = useTeamsQuery(organizationId);
	const membersQuery = useOrganizationMembersQuery(organizationId);

	const [dialog, setDialog] = useState<DialogState | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Team.Item | null>(null);

	const createMutation = useCreateTeamMutation(organizationId);
	const updateTarget = dialog?.mode === "edit" ? dialog.team : undefined;
	const updateMutation = useUpdateTeamMutation(
		organizationId,
		updateTarget?.id ?? "",
	);
	const deleteMutation = useDeleteTeamMutation(
		organizationId,
		deleteTarget?.id ?? "",
	);

	const teams = teamsQuery.data?.data.data ?? [];
	const members = membersQuery.data?.data.data ?? [];

	const columns: ColumnDef<Team.Item>[] = [
		{
			id: "team",
			header: "Team Name",
			size: 260,
			cell: ({ row }) => {
				const team = row.original;
				return (
					<div className="flex min-w-0 items-center gap-3">
						<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-semibold capitalize text-primary-600">
							{team.name.charAt(0)}
						</span>
						<div className="flex min-w-0 flex-col">
							<Typography.T3
								weight="semibold"
								className="truncate text-gray-950 capitalize"
							>
								{team.name}
							</Typography.T3>
							<Typography.T6 className="truncate text-gray-500">
								{team.description ?? "No description"}
							</Typography.T6>
						</div>
					</div>
				);
			},
		},
		{
			id: "leader",
			header: "Team Leader",
			size: 220,
			cell: ({ row }) => {
				const { leader } = row.original;
				if (!leader) {
					return (
						<Typography.T6 className="text-gray-500">
							No leader assigned
						</Typography.T6>
					);
				}
				const displayName =
					`${leader.firstName ?? ""} ${leader.lastName ?? ""}`.trim();
				return (
					<div className="flex items-center gap-3">
						<Avatar
							size="sm"
							fallbackText={displayName || leader.email}
							className="border"
						/>
						<Typography.T3 weight="medium" className="truncate text-gray-950">
							{displayName || leader.email}
						</Typography.T3>
					</div>
				);
			},
		},
		{
			id: "members",
			header: "Members",
			size: 140,
			cell: ({ row }) => {
				const team = row.original;
				if (team.members.length === 0) {
					return <Typography.T6 className="text-gray-500">No members</Typography.T6>;
				}
				return (
					<AvatarGroup max={3}>
						{team.members.map((member) => {
							const displayName =
								`${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
								member.email;
							return (
								<Avatar key={member.id} fallbackText={displayName} className="border" />
							);
						})}
					</AvatarGroup>
				);
			},
		},
		{
			id: "actions",
			header: "",
			size: 210,
			cell: ({ row }) => {
				const team = row.original;
				return (
					<div className="flex items-center justify-end gap-1.5">
						<Button
							size="xs"
							variant="outline"
							onClick={() => setDialog({ mode: "view", team })}
						>
							View
						</Button>
						<Button
							size="xs"
							variant="gray"
							onClick={() => setDialog({ mode: "edit", team })}
						>
							Edit
						</Button>
						<Button size="xs" variant="alert" onClick={() => setDeleteTarget(team)}>
							Delete
						</Button>
					</div>
				);
			},
		},
	];

	const handleSubmit = (payload: TeamForm.Payload) => {
		if (!dialog) return;

		if (dialog.mode === "create") {
			createMutation.mutate(payload, {
				onSuccess: () => {
					toast.success("Team created");
					setDialog(null);
				},
				onError: () => toast.error("Could not create team"),
			});
			return;
		}

		updateMutation.mutate(payload, {
			onSuccess: () => {
				toast.success("Team updated");
				setDialog(null);
			},
			onError: () => toast.error("Could not update team"),
		});
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Team deleted");
				setDeleteTarget(null);
			},
			onError: () => toast.error("Could not delete team"),
		});
	};

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	return (
		<section className="space-y-4">
			<SectionHeader
				heading="Teams"
				description="Organize team members into functional groups."
				actions={
					<Button
						size="sm"
						className="w-fit"
						onClick={() => setDialog({ mode: "create" })}
					>
						Create Team
					</Button>
				}
			/>

			<Table
				data={teams}
				columns={columns}
				getRowId={(team) => team.id}
				isPending={teamsQuery.isLoading}
				isError={teamsQuery.isError}
				emptyState={
					<Typography.T4 className="text-gray-500">
						No teams yet. Create a team to group your members.
					</Typography.T4>
				}
			/>

			{dialog && (
				<TeamFormDialog
					open
					mode={dialog.mode}
					team={dialog.team}
					members={members.map((m) => m.user)}
					isSubmitting={isSubmitting}
					onOpenChange={(open) => {
						if (!open) setDialog(null);
					}}
					onSubmit={handleSubmit}
				/>
			)}

			<ConfirmationDialog
				open={Boolean(deleteTarget)}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				title="Delete team"
				description="This action cannot be undone."
				paragraph={`Delete the "${deleteTarget?.name}" team? Members assigned to this team will keep their membership in the organization.`}
				confirmLabel="Delete team"
				variant="alert"
				isPending={deleteMutation.isPending}
				pendingText="Deleting..."
				onConfirm={handleDelete}
			/>
		</section>
	);
}
