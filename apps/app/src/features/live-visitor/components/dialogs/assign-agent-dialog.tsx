import {
	Avatar,
	Button,
	cn,
	DialogWrapper,
	EmptyState,
	Icon,
	Typography,
	toast,
} from "@package/ui";

import { useOrganizationMembersQuery } from "@/features/organization/hooks";
import {
	useAssignVisitorAgentMutation,
	useVisitorInfoQuery,
} from "../../hooks";
import { useVisitorPanelsStore } from "../../store";
import { skeletonKeys } from "../../utility";

interface AssignAgentDialogProps {
	organizationId: string;
}

export function AssignAgentDialog({ organizationId }: AssignAgentDialogProps) {
	const openPanel = useVisitorPanelsStore((s) => s.openPanel);
	const visitorId = useVisitorPanelsStore((s) => s.visitorId);
	const closePanel = useVisitorPanelsStore((s) => s.closePanel);

	const isOpen = openPanel === "assign" && Boolean(visitorId);

	const { data: membersData, isLoading: membersLoading } =
		useOrganizationMembersQuery(isOpen ? organizationId : "");
	const { data: visitorData } = useVisitorInfoQuery(
		organizationId,
		isOpen ? visitorId : null,
	);

	const members = membersData?.data?.data ?? [];
	const currentAgentId = visitorData?.data?.data?.assignedAgentId ?? null;

	const mutation = useAssignVisitorAgentMutation(
		organizationId,
		visitorId ?? "",
	);

	const assign = (agentId: string | null) => {
		mutation.mutate(
			{ agentId },
			{
				onSuccess: () => {
					toast.success(agentId ? "Visitor assigned" : "Visitor unassigned");
					closePanel();
				},
				onError: () => toast.error("Could not update assignment"),
			},
		);
	};

	return (
		<DialogWrapper
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) closePanel();
			}}
			size="sm"
			title="Assign agent"
			description="Choose who should follow up with this visitor."
			footer={
				currentAgentId ? (
					<Button
						variant="alert-shade"
						size="sm"
						className="w-auto"
						isPending={mutation.isPending}
						onClick={() => assign(null)}
					>
						Unassign
					</Button>
				) : undefined
			}
		>
			{membersLoading && (
				<div className="flex flex-col gap-2">
					{skeletonKeys(3, "assign").map((key) => (
						<div key={key} className="h-12 animate-pulse rounded-[8px] bg-gray-100" />
					))}
				</div>
			)}

			{!membersLoading && members.length === 0 && (
				<EmptyState size="sm" icon="team" title="No teammates found" />
			)}

			{!membersLoading && members.length > 0 && (
				<ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
					{members.map((member) => {
						const isCurrent = member.user.id === currentAgentId;
						const fullName =
							[member.user.firstName, member.user.lastName]
								.filter(Boolean)
								.join(" ") || member.user.email;

						return (
							<li key={member.user.id}>
								<button
									type="button"
									disabled={mutation.isPending}
									onClick={() => assign(member.user.id)}
									className={cn(
										"flex w-full cursor-pointer items-center gap-3 rounded-[8px] border p-2.5 text-left transition-colors",
										isCurrent
											? "border-primary-200 bg-primary-50"
											: "border-gray-border-200 hover:bg-gray-fill-50",
									)}
								>
									<Avatar
										size="lg"
										image={member.user.profile ?? undefined}
										fallbackText={fullName.charAt(0).toUpperCase()}
										className="bg-gray-200"
									/>
									<div className="flex min-w-0 flex-1 flex-col">
										<Typography.T4 weight="medium" className="truncate text-gray-950">
											{fullName}
										</Typography.T4>
										<Typography.T6 className="truncate text-gray-500">
											{member.user.email}
										</Typography.T6>
									</div>
									{isCurrent && (
										<Icon name="tick" size={16} className="shrink-0 text-primary-500" />
									)}
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</DialogWrapper>
	);
}
