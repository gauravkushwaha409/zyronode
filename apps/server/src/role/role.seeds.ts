/**
 * Permission registry + system role matrix. Single source for both seeding
 * (`RoleSeedService`) and the immutable system roles. Permission `keys` are
 * `module.resource.verb` and are stable identifiers — never rename a seeded
 * key after release; add new ones additively.
 */

export interface PermissionSeed {
	key: string;
	name: string;
	description: string;
	module: string;
}

export const PERMISSION_SEEDS: PermissionSeed[] = [
	// inbox / conversations
	{ key: "inbox.read", name: "View conversations", description: "Read conversations and messages", module: "inbox" },
	{ key: "inbox.write", name: "Send messages", description: "Send messages and manage conversations", module: "inbox" },
	// visitors
	{ key: "visitors.read", name: "View visitors", description: "See tracked visitors and their details", module: "visitors" },
	{ key: "visitors.write", name: "Edit visitors", description: "Update visitors and change assignment", module: "visitors" },
	// analytics
	{ key: "analytics.read", name: "View analytics", description: "Read metrics and reports", module: "analytics" },
	// team management
	{ key: "team.members.read", name: "View members", description: "See workspace members", module: "team" },
	{ key: "team.members.write", name: "Manage members", description: "Edit members and their roles", module: "team" },
	{ key: "team.invitations.read", name: "View invitations", description: "See pending team invitations", module: "team" },
	{ key: "team.invitations.write", name: "Manage invitations", description: "Invite and revoke team members", module: "team" },
	{ key: "team.teams.read", name: "View teams", description: "See teams/departments", module: "team" },
	{ key: "team.teams.write", name: "Manage teams", description: "Create and edit teams", module: "team" },
	{ key: "team.roles.read", name: "View roles", description: "See roles and their permissions", module: "team" },
	{ key: "team.roles.write", name: "Manage roles", description: "Create, edit and delete custom roles", module: "team" },
	// settings
	{ key: "settings.organization.read", name: "View organization settings", description: "Read organization info and integrations", module: "settings" },
	{ key: "settings.organization.write", name: "Manage organization settings", description: "Update organization info and integrations", module: "settings" },
	{ key: "settings.widget.read", name: "View widget settings", description: "Read chat widget configuration", module: "settings" },
	{ key: "settings.widget.write", name: "Manage widget settings", description: "Update chat widget appearance and behaviour", module: "settings" },
	{ key: "settings.billing.read", name: "View billing", description: "View plan and subscription details", module: "settings" },
	{ key: "settings.billing.write", name: "Manage billing", description: "Change plan and payment details", module: "settings" },
];

export interface SystemRoleSeed {
	name: string;
	description: string;
	permissions: string[];
}

export const SYSTEM_ROLE_SEEDS: SystemRoleSeed[] = [
	{
		name: "Owner",
		description: "Full access to the organization, teams and billing.",
		permissions: PERMISSION_SEEDS.map((p) => p.key),
	},
	{
		name: "Admin",
		description: "Full access to all settings, teams and billing.",
		permissions: PERMISSION_SEEDS.map((p) => p.key),
	},
	{
		name: "Manager",
		description: "Manage teams, members and conversations.",
		permissions: [
			"inbox.read",
			"inbox.write",
			"visitors.read",
			"visitors.write",
			"analytics.read",
			"team.members.read",
			"team.members.write",
			"team.invitations.read",
			"team.invitations.write",
			"team.teams.read",
			"team.teams.write",
			"team.roles.read",
			"settings.organization.read",
			"settings.widget.read",
			"settings.billing.read",
		],
	},
	{
		name: "Agent",
		description: "Handle conversations and visitors.",
		permissions: ["inbox.read", "inbox.write", "visitors.read", "visitors.write", "analytics.read"],
	},
	{
		name: "Viewer",
		description: "Read-only access to analytics and conversations.",
		permissions: ["inbox.read", "visitors.read", "analytics.read"],
	},
];