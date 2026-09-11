import type { ColumnDef } from "@package/ui";
import {
	Badge,
	Button,
	ConfirmationDialog,
	SectionHeader,
	Typography,
	toast,
} from "@package/ui";
import { useState } from "react";
import { Table } from "@/components";
import {
	useCreateTeamInvitationMutation,
	useRevokeTeamInvitationMutation,
	useRolesQuery,
	useTeamInvitationsQuery,
	useTeamsQuery,
} from "../../hooks";
import type { TeamInvitation } from "../../types";
import { TeamInvitationFormDialog } from "./team-invitation-form-dialog";

interface TeamInvitationTabProps {
	organizationId: string;
	inviteDialogOpen: boolean;
	onInviteDialogOpenChange: (open: boolean) => void;
}

const STATUS_VARIANT = {
	PENDING: "warning",
	ACCEPTED: "success",
	REVOKED: "alert",
	EXPIRED: "secondary",
} as const;

export function TeamInvitationTab({
	organizationId,
	inviteDialogOpen,
	onInviteDialogOpenChange,
}: TeamInvitationTabProps) {
	const invitationsQuery = useTeamInvitationsQuery(organizationId);
	const teamsQuery = useTeamsQuery(organizationId);
	const rolesQuery = useRolesQuery(organizationId);

	const [revokeTarget, setRevokeTarget] = useState<TeamInvitation.Item | null>(
		null,
	);

	const createMutation = useCreateTeamInvitationMutation(organizationId);
	const revokeMutation = useRevokeTeamInvitationMutation(
		organizationId,
		revokeTarget?.id ?? "",
	);

	const invitations = invitationsQuery.data?.data.data ?? [];
	const teams = teamsQuery.data?.data.data ?? [];
	const roles = rolesQuery.data?.data.data ?? [];

	const columns: ColumnDef<TeamInvitation.Item>[] = [
		{
			id: "email",
			header: "Email",
			cell: ({ row }) => (
				<Badge variant="info" size="xs">
					{row.original.email}
				</Badge>
			),
		},
		{
			id: "role",
			header: "Role",
			cell: ({ row }) => (
				<Typography.T3 weight="medium" className="text-gray-950">
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
					<Badge size="xs" dot dotVariant="info">
						{team.name}
					</Badge>
				);
			},
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					radius="rounded"
					variant={STATUS_VARIANT[row.original.status]}
					dot
					size="xs"
					className="capitalize"
				>
					{row.original.status.toLowerCase()}
				</Badge>
			),
		},
		{
			id: "actions",
			header: "",
			size: 120,
			cell: ({ row }) => {
				const invitation = row.original;
				if (invitation.status !== "PENDING") return null;
				return (
					<div className="flex justify-end">
						<Button
							size="xs"
							variant="alert"
							onClick={() => setRevokeTarget(invitation)}
						>
							Revoke
						</Button>
					</div>
				);
			},
		},
	];

	const handleInvite = (payload: TeamInvitation.CreatePayload) => {
		createMutation.mutate(payload, {
			onSuccess: () => {
				toast.success("Invitation sent");
				onInviteDialogOpenChange(false);
			},
			onError: () => toast.error("Could not send invitation"),
		});
	};

	const handleRevoke = () => {
		if (!revokeTarget) return;
		revokeMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Invitation revoked");
				setRevokeTarget(null);
			},
			onError: () => toast.error("Could not revoke invitation"),
		});
	};

	return (
		<section className="space-y-4">
			<SectionHeader
				heading="Invitations"
				description="Pending and past team invitations."
				actions={
					<Button
						size="sm"
						className="w-fit"
						onClick={() => onInviteDialogOpenChange(true)}
					>
						Invite Team Member
					</Button>
				}
			/>

			<Table
				data={invitations}
				columns={columns}
				getRowId={(invitation) => invitation.id}
				isPending={invitationsQuery.isLoading}
				isError={invitationsQuery.isError}
				emptyState={
					<Typography.T4 className="text-gray-500">
						No invitations yet. Invite someone to join this organization.
					</Typography.T4>
				}
			/>

			<TeamInvitationFormDialog
				open={inviteDialogOpen}
				teams={teams}
				roles={roles}
				isSubmitting={createMutation.isPending}
				onOpenChange={onInviteDialogOpenChange}
				onSubmit={handleInvite}
			/>

			<ConfirmationDialog
				open={Boolean(revokeTarget)}
				onOpenChange={(open) => {
					if (!open) setRevokeTarget(null);
				}}
				title="Revoke invitation"
				description="This action cannot be undone."
				paragraph={`Revoke the pending invitation for "${revokeTarget?.email}"?`}
				confirmLabel="Revoke invitation"
				variant="alert"
				isPending={revokeMutation.isPending}
				pendingText="Revoking..."
				onConfirm={handleRevoke}
			/>
		</section>
	);
}
