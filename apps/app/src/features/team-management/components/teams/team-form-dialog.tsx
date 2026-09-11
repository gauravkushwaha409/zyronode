import {
	FormInput,
	FormTextarea,
	FormWrapper,
	useFormContext,
} from "@package/form";
import { Avatar, Button, cn, DialogWrapper, Typography } from "@package/ui";
import { useEffect } from "react";
import { useTeamForm } from "../../hooks/form-handler";
import type { TeamForm } from "../../types";

const MODE_TITLE: Record<TeamForm.Mode, string> = {
	create: "Create team",
	edit: "Edit team",
	view: "View team",
};

export function TeamFormDialog({
	open,
	mode,
	team,
	members = [],
	onOpenChange,
	onSubmit,
	isSubmitting = false,
}: TeamForm.Props) {
	const form = useTeamForm();
	const isReadOnly = mode === "view";

	useEffect(() => {
		if (!open) return;
		form.reset({
			name: team?.name ?? "",
			description: team?.description ?? "",
			leaderId: team?.leader?.id ?? "",
		});
	}, [open, team, form]);

	const title = MODE_TITLE[mode];

	const handleSubmit = form.handleSubmit((payload) => {
		onSubmit({
			name: payload.name,
			description: payload.description || undefined,
			leaderId: payload.leaderId || undefined,
		});
	});

	return (
		<DialogWrapper
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			description={
				isReadOnly
					? `${team?.name ?? "Team"} details.`
					: "Define the team name, description, and optional leader."
			}
			footer={
				isReadOnly ? (
					<Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				) : (
					<>
						<Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							size="sm"
							isPending={isSubmitting}
							pendingText={mode === "create" ? "Creating..." : "Saving..."}
							onClick={() => handleSubmit()}
						>
							{mode === "create" ? "Create team" : "Save changes"}
						</Button>
					</>
				)
			}
		>
			<FormWrapper
				useFormMethods={form}
				formProps={{ className: "space-y-4", onSubmit: handleSubmit }}
			>
				{isReadOnly ? (
					<div className="space-y-4">
						<div>
							<Typography.T4 className="mb-1 font-medium text-gray-500">
								Team name
							</Typography.T4>
							<Typography.T3 weight="medium" className="text-gray-950">
								{team?.name}
							</Typography.T3>
						</div>
						<div>
							<Typography.T4 className="mb-1 font-medium text-gray-500">
								Description
							</Typography.T4>
							<Typography.T3 className="text-gray-950">
								{team?.description || "—"}
							</Typography.T3>
						</div>
						<div>
							<Typography.T4 className="mb-1 font-medium text-gray-500">
								Team Leader
							</Typography.T4>
							{team?.leader ? (
								<div className="flex items-center gap-2 mt-1">
									<Avatar
										fallbackText={team.leader.firstName ?? team.leader.email}
										size="xs"
									/>
									<Typography.T3 className="text-gray-950">
										{team.leader.firstName} {team.leader.lastName}
									</Typography.T3>
								</div>
							) : (
								<Typography.T4 className="text-gray-500 italic">
									No leader assigned
								</Typography.T4>
							)}
						</div>
					</div>
				) : (
					<>
						<FormInput
							name="name"
							label="Team name"
							placeholder="e.g. Support, Engineering"
							required
						/>
						<FormTextarea
							name="description"
							label="Description (optional)"
							placeholder="Brief description of what this team does"
							rows={3}
						/>
						<LeaderSelect members={members} />
					</>
				)}
			</FormWrapper>
		</DialogWrapper>
	);
}

function LeaderSelect({
	members,
}: {
	members: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string;
	}[];
}) {
	const { setValue, watch } = useFormContext();
	const currentLeaderId = (watch("leaderId") as string) ?? "";

	return (
		<div className="space-y-1.5">
			<Typography.T4 className="font-medium text-gray-500">
				Team leader <span className="font-normal text-gray-400">(optional)</span>
			</Typography.T4>
			<select
				value={currentLeaderId}
				onChange={(event) => setValue("leaderId", event.target.value)}
				className={cn(
					"w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm",
					"focus:outline-none focus:ring-1 focus:ring-primary-400",
					"bg-white text-gray-950 disabled:bg-gray-50",
				)}
			>
				<option value="">None</option>
				{members.map((member) => (
					<option key={member.id} value={member.id}>
						{member.firstName} {member.lastName} ({member.email})
					</option>
				))}
			</select>
		</div>
	);
}
