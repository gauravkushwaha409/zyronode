import { Badge, Typography } from "@package/ui";

interface RoleCard {
	role: string;
	variant: "success" | "magenta" | "info" | "secondary";
	tag: string;
	description: string;
	capabilities: string[];
}

const PLATFORM_ROLES: RoleCard[] = [
	{
		role: "SUPER_ADMIN",
		variant: "success",
		tag: "Highest Privilege",
		description:
			"Complete platform ownership with unrestricted access across all organizations, users, system settings, and infrastructure.",
		capabilities: [
			"Full platform administration and configuration",
			"Promote or demote users to platform staff roles",
			"Manage global system roles and permissions",
			"Access all cross-organization management endpoints",
			"Override organization states and enforce platform policies",
		],
	},
	{
		role: "ADMIN",
		variant: "magenta",
		tag: "Platform Staff",
		description:
			"Administrative oversight over organizations, billing, user accounts, and platform monitoring.",
		capabilities: [
			"Browse and inspect all platform organizations",
			"Search and manage platform user directory",
			"Review audit logs and metrics",
			"Manage global role definitions and view permission registry",
		],
	},
	{
		role: "MANAGER",
		variant: "info",
		tag: "Support & Operations",
		description:
			"Platform support team access for assisting customers, diagnosing issues, and operations oversight.",
		capabilities: [
			"View platform user and organization directories",
			"Access system metrics and diagnostics",
			"View-only access to system roles and permissions",
		],
	},
	{
		role: "NONE",
		variant: "secondary",
		tag: "Portal Users",
		description:
			"Regular customer portal users. Strictly blocked from logging into the platform admin panel.",
		capabilities: [
			"No access to admin dashboard or /api/v1/admin endpoints",
			"Access governed entirely by organization-level roles (Owner, Manager, Agent, Custom)",
		],
	},
];

export function PlatformRolesInfo() {
	return (
		<div className="space-y-6">
			<div>
				<Typography.T2 weight="semibold" className="text-gray-950">
					Platform Admin Roles & Security Architecture
				</Typography.T2>
				<Typography.T4 className="text-gray-500">
					Platform roles are distinct from organization roles and govern access to
					this administrative console.
				</Typography.T4>
			</div>

			<div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-2">
				<Typography.T3 weight="semibold" className="text-blue-900">
					Architecture Note: Platform Roles vs. Organization Roles
				</Typography.T3>
				<p className="text-sm text-blue-800 leading-relaxed">
					Platform roles are stored through <code>User.platformRoleId</code> and require
					an <code>admin</code>-scoped JWT. Organization roles
					(Owner, Manager, Agent, and Custom) are organization-specific and scoped to
					individual workspaces. Platform administrators never reuse organization
					tokens for platform-level access.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{PLATFORM_ROLES.map((item) => (
					<div
						key={item.role}
						className="rounded-xl border border-gray-border-50 bg-white-base p-5 shadow-xs space-y-3"
					>
						<div className="flex items-center justify-between border-b border-gray-100 pb-3">
							<div className="flex items-center gap-2">
								<Badge variant={item.variant} size="sm">
									{item.role.replace("_", " ")}
								</Badge>
							</div>
							<span className="text-xs font-medium text-gray-500">{item.tag}</span>
						</div>

						<p className="text-sm text-gray-600">{item.description}</p>

						<div className="pt-2">
							<span className="text-xs font-semibold text-gray-800 uppercase tracking-wider block mb-2">
								Capabilities:
							</span>
							<ul className="space-y-1.5 text-xs text-gray-600">
								{item.capabilities.map((cap) => (
									<li key={cap} className="flex items-start gap-2">
										<span className="text-primary-600 mt-0.5">•</span>
										<span>{cap}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
