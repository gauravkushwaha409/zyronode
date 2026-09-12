import { FormInput, FormWrapper, useFormContext } from "@package/form";
import { Button, cn, DialogWrapper, Typography } from "@package/ui";
import { useEffect } from "react";
import { useTeamInvitationForm } from "../../hooks/form-handler";
import type { Role, Team, TeamInvitation } from "../../types";

interface TeamInvitationFormDialogProps {
	open: boolean;
	teams: Team.Item[];
	roles: Role.Item[];
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: TeamInvitation.CreatePayload) => void;
	isSubmitting?: boolean;
}

export function TeamInvitationFormDialog({
	open,
	teams,
	roles,
	onOpenChange,
	onSubmit,
	isSubmitting = false,
}: TeamInvitationFormDialogProps) {
	const form = useTeamInvitationForm();

	useEffect(() => {
		if (!open) return;
		form.reset({ email: "", teamId: "", roleId: "" });
	}, [open, form]);

	const handleSubmit = form.handleSubmit((payload) => {
		onSubmit({
			email: payload.email,
			teamId: payload.teamId || undefined,
			roleId: payload.roleId || undefined,
		});
	});

	return (
		<DialogWrapper
			open={open}
			onOpenChange={onOpenChange}
			title="Invite team member"
			description="Send an invitation to join this organization."
			footer={
				<>
					<Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						size="sm"
						isPending={isSubmitting}
						pendingText="Sending..."
						onClick={() => handleSubmit()}
					>
						Send invitation
					</Button>
				</>
			}
		>
			<FormWrapper
				useFormMethods={form}
				formProps={{ className: "space-y-4", onSubmit: handleSubmit }}
			>
				<FormInput
					name="email"
					label="Email"
					placeholder="newagent@chatboq.com"
					inputProps={{ type: "email" }}
					required
				/>
				<RoleSelect roles={roles} />
				<TeamSelect teams={teams} />
			</FormWrapper>
		</DialogWrapper>
	);
}

function RoleSelect({ roles }: { roles: Role.Item[] }) {
	const { setValue, watch } = useFormContext();
	const currentRoleId = (watch("roleId") as string) ?? "";

	return (
		<div className="space-y-1.5">
			<Typography.T4 className="font-medium text-gray-500">
				Role <span className="font-normal text-gray-400">(optional)</span>
			</Typography.T4>
			<select
				value={currentRoleId}
				onChange={(event) => setValue("roleId", event.target.value)}
				className={cn(
					"w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm",
					"focus:outline-none focus:ring-1 focus:ring-primary-400",
					"bg-white text-gray-950 disabled:bg-gray-50",
				)}
			>
				<option value="">None</option>
				{roles.map((role) => (
					<option key={role.id} value={role.id}>
						{role.name}
					</option>
				))}
			</select>
		</div>
	);
}

function TeamSelect({ teams }: { teams: Team.Item[] }) {
	const { setValue, watch } = useFormContext();
	const currentTeamId = (watch("teamId") as string) ?? "";

	return (
		<div className="space-y-1.5">
			<Typography.T4 className="font-medium text-gray-500">
				Team <span className="font-normal text-gray-400">(optional)</span>
			</Typography.T4>
			<select
				value={currentTeamId}
				onChange={(event) => setValue("teamId", event.target.value)}
				className={cn(
					"w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm",
					"focus:outline-none focus:ring-1 focus:ring-primary-400",
					"bg-white text-gray-950 disabled:bg-gray-50",
				)}
			>
				<option value="">None</option>
				{teams.map((team) => (
					<option key={team.id} value={team.id}>
						{team.name}
					</option>
				))}
			</select>
		</div>
	);
}
