import {
	Button,
	cn,
	PageHeader,
	StatsCard,
	TabbedDashboard,
	Typography,
} from "@package/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	RolesTab,
	TeamInvitationTab,
	TeamMembersTab,
	TeamsTab,
	useOrganizationMembersQuery,
	useRolesQuery,
	useTeamInvitationsQuery,
	useTeamsQuery,
} from "@/features/team-management";

export const Route = createFileRoute(
	"/_organization-protected/$organization/settings/team-management",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { organization } = Route.useParams();
	const [activeTab, setActiveTab] =
		useState<(typeof TABS)[number]["id"]>("team-invitation");
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

	const openInviteDialog = () => {
		setActiveTab("team-invitation");
		setInviteDialogOpen(true);
	};

	return (
		<section className="h-full space-y-5 px-11 pt-6">
			<PageHeader
				title="Team Management"
				description="Manage workspace members, departments and access structure."
				actions={
					<Button
						className="w-fit"
						variant="outline"
						size="xs"
						onClick={openInviteDialog}
					>
						Invite Team Member
					</Button>
				}
			/>
			<GrowingTeams />
			<Stats organizationId={organization} />
			<TeamManagementTabs
				organizationId={organization}
				activeTab={activeTab}
				onActiveTabChange={setActiveTab}
				inviteDialogOpen={inviteDialogOpen}
				onInviteDialogOpenChange={setInviteDialogOpen}
			/>
		</section>
	);
}

const GrowingTeams = () => (
	<section className="px-6 relative overflow-hidden py-5 rounded-[12px] border border-primary-100 bg-primary-25 border border-red-500">
		<div className="absolute right-0 top-0 z-0 pointer-events-none">
			<img
				src="/images/app/settings/team-management.svg"
				alt="team-management"
				className="object-contain translate-x-16 opacity-100 w-74 h-36.5"
				// onError={(e) => (e.currentTarget.style.display = "none")}
			/>
		</div>
		<div className="relative z-10 w-125">
			<Typography.H6 weight="semibold" className="text-gray-950">
				Structured access for
			</Typography.H6>
			<Typography.H6 weight="semibold" className="text-primary-500 mb-1.5">
				Growing Teams
			</Typography.H6>
			<Typography.T3 weight="regular" className="text-gray-500">
				Create custom access levels, manage department permissions, and keep team
				operations structured as your organization scales.
			</Typography.T3>
		</div>
	</section>
);

const Stats = ({ organizationId }: { organizationId: string }) => {
	const membersQuery = useOrganizationMembersQuery(organizationId);
	const teamsQuery = useTeamsQuery(organizationId);
	const rolesQuery = useRolesQuery(organizationId);
	const invitationsQuery = useTeamInvitationsQuery(organizationId);

	const members = membersQuery.data?.data.data ?? [];
	const teams = teamsQuery.data?.data.data ?? [];
	const roles = rolesQuery.data?.data.data ?? [];
	const invitations = invitationsQuery.data?.data.data ?? [];
	const pendingInvites = invitations.filter(
		(i) => i.status === "PENDING",
	).length;

	const TEAM_STATS = [
		{
			icon: "team" as const,
			title: "Total Team Members",
			statNum: members.length,
		},
		{ icon: "department" as const, title: "Total Team", statNum: teams.length },
		{ icon: "role" as const, title: "Total Roles", statNum: roles.length },
		{
			icon: "pending-invite" as const,
			title: "Pending Invites",
			statNum: pendingInvites,
		},
	];
	return (
		<section className="grid grid-cols-4 gap-5 pt-4 border-b border-gray-200 pb-6">
			{TEAM_STATS.map((stats) => (
				<StatsCard
					key={stats.title}
					title={stats.title}
					icon={stats.icon}
					statNum={stats.statNum}
				/>
			))}
		</section>
	);
};

const TeamManagementTabsButton = ({
	label,
	isSelected,
	onClick,
}: {
	tabId: string;
	label: string;
	isSelected: boolean;
	onClick: () => void;
}) => (
	<button
		onClick={onClick}
		className={cn(
			"typo-t2 cursor-pointer font-semibold text-gray-500 px-3.5 py-2 rounded-[6px]",
			isSelected ? "bg-primary-50 text-gray-800" : "hover:bg-primary-25",
		)}
		type="button"
	>
		{label}
	</button>
);

const TABS = [
	{ id: "team-invitation", label: "Team Invitation" },
	{ id: "team-members", label: "Team Members" },
	{ id: "teams", label: "Teams" },
	{ id: "roles", label: "Roles" },
] as const;

function TeamManagementTabs({
	organizationId,
	activeTab,
	onActiveTabChange,
	inviteDialogOpen,
	onInviteDialogOpenChange,
}: {
	organizationId: string;
	activeTab: (typeof TABS)[number]["id"];
	onActiveTabChange: (tab: (typeof TABS)[number]["id"]) => void;
	inviteDialogOpen: boolean;
	onInviteDialogOpenChange: (open: boolean) => void;
}) {
	const dashboard = {
		currentTabId: activeTab,
		onChange: onActiveTabChange,
		tabs: TABS.map((t) => ({
			...t,
			content: () => {
				if (t.id === "team-invitation")
					return (
						<TeamInvitationTab
							organizationId={organizationId}
							inviteDialogOpen={inviteDialogOpen}
							onInviteDialogOpenChange={onInviteDialogOpenChange}
						/>
					);
				if (t.id === "team-members")
					return <TeamMembersTab organizationId={organizationId} />;
				if (t.id === "teams") return <TeamsTab organizationId={organizationId} />;
				return <RolesTab organizationId={organizationId} />;
			},
		})),
	} as never;

	return (
		<section className="pt-1">
			<TabbedDashboard
				dashboard={dashboard}
				TabButton={TeamManagementTabsButton}
				tabWrapperProps={{ className: "flex gap-1" }}
				contentWrapperProps={{ className: "my-6" }}
			/>
		</section>
	);
}
