import {
	Avatar,
	AvatarGroup,
	Badge,
	Button,
	cn,
	PageHeader,
	SectionHeader,
	StatsCard,
	TabbedDashboard,
	Typography,
} from "@package/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RolesTab as TeamRolesTab } from "@/features/team-management";

export const Route = createFileRoute(
	"/_organization-protected/$organization/settings/team-management",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { organization } = Route.useParams();
	return (
		<section className="space-y-5 px-11 pt-6">
			<PageHeader
				title="Team Management"
				description="Manage workspace members, departments and access structure."
				actions={
					<Button className="w-fit" variant="outline" size="xs" onClick={() => {}}>
						Invite Team Member
					</Button>
				}
			/>
			<GrowingTeams />
			<Stats />
			<TeamManagementTabs organizationId={organization} />
		</section>
	);
}

const GrowingTeams = () => (
	<section className="px-6 relative overflow-hidden py-5 rounded-[12px] border border-primary-100 bg-primary-25">
		<div className="absolute right-0 top-0 z-0 pointer-events-none">
			<img
				src="/images/app/settings/team-management.svg"
				alt="team-management"
				className="object-contain translate-x-16 opacity-100 w-74 h-36.5"
				onError={(e) => (e.currentTarget.style.display = "none")}
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

const Stats = () => {
	const TEAM_STATS = [
		{ icon: "team" as const, title: "Total Team Members", statNum: 12 },
		{ icon: "department" as const, title: "Total Team", statNum: 4 },
		{ icon: "role" as const, title: "Total Roles", statNum: 5 },
		{ icon: "pending-invite" as const, title: "Pending Invites", statNum: 3 },
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

function TeamManagementTabs({ organizationId }: { organizationId: string }) {
	const [active, setActive] =
		useState<(typeof TABS)[number]["id"]>("team-invitation");
	const dashboard = {
		currentTabId: active,
		onChange: setActive,
		tabs: TABS.map((t) => ({
			...t,
			content: () => {
				if (t.id === "team-invitation") return <TeamInvitationTab />;
				if (t.id === "team-members") return <TeamMembersTab />;
				if (t.id === "teams") return <TeamsTab />;
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

function TeamInvitationTab() {
	const rows = [
		{
			email: "alex@chatboq.com",
			role: "Agent",
			team: { name: "Support", color: "info" },
			status: "pending" as const,
		},
		{
			email: "jane@chatboq.com",
			role: "Manager",
			team: { name: "Sales", color: "success" },
			status: "pending" as const,
		},
		{
			email: "mike@chatboq.com",
			role: "Admin",
			team: { name: "Engineering", color: "warning" },
			status: "accepted" as const,
		},
	];
	const statusVariant = {
		pending: "warning",
		accepted: "success",
		revoked: "alert",
		expired: "secondary",
	} as const;
	return (
		<section className="space-y-4">
			<SectionHeader
				heading="Invitations"
				description="Pending team invitations."
			/>
			<div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
				<table className="w-full text-sm">
					<thead className="bg-gray-50 text-gray-500">
						<tr>
							<th className="text-left font-medium px-4 py-2.5">Email</th>
							<th className="text-left font-medium px-4 py-2.5">Role</th>
							<th className="text-left font-medium px-4 py-2.5">Team</th>
							<th className="text-left font-medium px-4 py-2.5">Status</th>
							<th className="w-12" />
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.map((r) => (
							<tr key={r.email} className="hover:bg-gray-50">
								<td className="px-4 py-3">
									<Badge variant="info" size="xs">
										{r.email}
									</Badge>
								</td>
								<td className="px-4 py-3">
									<Typography.T3 weight="medium" className="text-gray-950 capitalize">
										{r.role}
									</Typography.T3>
								</td>
								<td className="px-4 py-3">
									<Badge size="xs" dot dotVariant={r.team.color as never}>
										{r.team.name}
									</Badge>
								</td>
								<td className="px-4 py-3">
									<Badge
										radius="rounded"
										variant={statusVariant[r.status]}
										dot
										size="xs"
										className="capitalize"
									>
										{r.status}
									</Badge>
								</td>
								<td className="px-4 py-3 text-right text-gray-400">⋯</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
function TeamMembersTab() {
	const rows = [
		{
			name: "John Doe",
			email: "john@chatboq.com",
			role: "Admin",
			team: { name: "Support", color: "info" },
			status: "active",
			online: true,
			avatar: "",
		},
		{
			name: "Sarah Lee",
			email: "sarah@chatboq.com",
			role: "Agent",
			team: { name: "Engineering", color: "warning" },
			status: "active",
			online: false,
			avatar: "",
		},
		{
			name: "Alex Kim",
			email: "alex@chatboq.com",
			role: "Manager",
			team: { name: "Sales", color: "success" },
			status: "inactive",
			online: false,
			avatar: "",
		},
	];
	return (
		<section className="space-y-4">
			<SectionHeader heading="Members" description="All workspace members." />
			<div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
				<table className="w-full text-sm">
					<thead className="bg-gray-50 text-gray-500">
						<tr>
							<th className="text-left font-medium px-4 py-2.5">Name</th>
							<th className="text-left font-medium px-4 py-2.5">Email</th>
							<th className="text-left font-medium px-4 py-2.5">Role</th>
							<th className="text-left font-medium px-4 py-2.5">Team</th>
							<th className="text-left font-medium px-4 py-2.5">Status</th>
							<th className="w-12" />
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.map((r) => (
							<tr key={r.email} className="hover:bg-gray-50">
								<td className="px-4 py-3">
									<div className="flex items-center gap-3 min-w-0 max-w-60">
										<Avatar
											fallbackText={r.name}
											size="sm"
											showAvatarBadge
											isActive={r.online}
											className="border shrink-0"
										/>
										<Typography.T3 weight="semibold" className="text-gray-950 truncate">
											{r.name}
										</Typography.T3>
									</div>
								</td>
								<td className="px-4 py-3">
									<Badge size="xs" variant="info">
										{r.email}
									</Badge>
								</td>
								<td className="px-4 py-3">
									<Typography.T3 weight="medium" className="text-gray-950 capitalize">
										{r.role}
									</Typography.T3>
								</td>
								<td className="px-4 py-3">
									<Badge dot dotVariant={r.team.color as never} size="xs">
										{r.team.name}
									</Badge>
								</td>
								<td className="px-4 py-3">
									<Badge
										variant={r.status === "active" ? "success" : "secondary"}
										radius="rounded"
										size="xs"
										dot
										className="capitalize"
									>
										{r.status}
									</Badge>
								</td>
								<td className="px-4 py-3 text-right text-gray-400">⋯</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
function TeamsTab() {
	const rows = [
		{
			name: "Support",
			color: "info",
			leader: { name: "John Doe", online: true },
			members: [
				{ name: "John Doe" },
				{ name: "Sarah Lee" },
				{ name: "Alex Kim" },
				{ name: "Jane" },
			],
			status: "active" as const,
		},
		{
			name: "Sales",
			color: "success",
			leader: null,
			members: [{ name: "Mike" }],
			status: "active" as const,
		},
		{
			name: "Engineering",
			color: "warning",
			leader: { name: "Sarah Lee", online: false },
			members: [],
			status: "active" as const,
		},
	];
	return (
		<section className="space-y-5 min-w-0">
			<SectionHeader
				heading="Team List"
				description="Organize teams by function and responsibility."
				actions={
					<Button
						size="sm"
						rightIcon="department"
						className="w-fit"
						onClick={() => {}}
					>
						Add Teams
					</Button>
				}
			/>
			<div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
				<table className="w-full text-sm">
					<thead className="bg-gray-50 text-gray-500">
						<tr>
							<th className="text-left font-medium px-4 py-2.5">Name</th>
							<th className="text-left font-medium px-4 py-2.5">Team Leader</th>
							<th className="text-left font-medium px-4 py-2.5">Members</th>
							<th className="text-left font-medium px-4 py-2.5">Status</th>
							<th className="w-12" />
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.map((r) => (
							<tr key={r.name} className="hover:bg-gray-50">
								<td className="px-4 py-3">
									<Badge
										size="xs"
										dot
										dotVariant={r.color as never}
										className="font-medium"
									>
										{r.name}
									</Badge>
								</td>
								<td className="px-4 py-3">
									{r.leader ? (
										<div className="flex items-center gap-3">
											<Avatar
												size="sm"
												fallbackText={r.leader.name}
												showAvatarBadge
												isActive={r.leader.online}
												className="border"
											/>
											<Typography.T3 weight="medium" className="text-gray-950">
												{r.leader.name}
											</Typography.T3>
										</div>
									) : (
										<Typography.T6 className="text-gray-500">
											No leader assigned
										</Typography.T6>
									)}
								</td>
								<td className="px-4 py-3">
									{r.members.length === 0 ? (
										<Typography.T6 className="text-gray-500">No members</Typography.T6>
									) : (
										<AvatarGroup max={3}>
											{r.members.map((m) => (
												<Avatar key={m.name} fallbackText={m.name} className="border" />
											))}
										</AvatarGroup>
									)}
								</td>
								<td className="px-4 py-3">
									<Badge
										radius="rounded"
										size="sm"
										dot
										variant={r.status === "active" ? "success" : "alert"}
									>
										{r.status}
									</Badge>
								</td>
								<td className="px-4 py-3 text-right text-gray-400">⋯</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
function RolesTab({ organizationId }: { organizationId: string }) {
	return <TeamRolesTab organizationId={organizationId} />;
}
