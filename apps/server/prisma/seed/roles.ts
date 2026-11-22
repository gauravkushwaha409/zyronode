import type { PrismaClient } from "../../src/generated/prisma/client";
import { SYSTEM_ROLE_IDS } from "../../src/role/role.constants";

const PERMISSIONS = [
	{
		key: "inbox.read",
		name: "View conversations",
		description: "Read conversations and messages",
		module: "inbox",
	},
	{
		key: "inbox.write",
		name: "Send messages",
		description: "Send messages and manage conversations",
		module: "inbox",
	},
	{
		key: "visitors.read",
		name: "View visitors",
		description: "See tracked visitors and their details",
		module: "visitors",
	},
	{
		key: "visitors.write",
		name: "Edit visitors",
		description: "Update visitors and change assignment",
		module: "visitors",
	},
	{
		key: "analytics.read",
		name: "View analytics",
		description: "Read metrics and reports",
		module: "analytics",
	},
	{
		key: "team.members.read",
		name: "View members",
		description: "See workspace members",
		module: "team",
	},
	{
		key: "team.members.write",
		name: "Manage members",
		description: "Edit members and their roles",
		module: "team",
	},
	{
		key: "team.invitations.read",
		name: "View invitations",
		description: "See pending team invitations",
		module: "team",
	},
	{
		key: "team.invitations.write",
		name: "Manage invitations",
		description: "Invite and revoke team members",
		module: "team",
	},
	{
		key: "team.teams.read",
		name: "View teams",
		description: "See teams/departments",
		module: "team",
	},
	{
		key: "team.teams.write",
		name: "Manage teams",
		description: "Create and edit teams",
		module: "team",
	},
	{
		key: "team.roles.read",
		name: "View roles",
		description: "See roles and their permissions",
		module: "team",
	},
	{
		key: "team.roles.write",
		name: "Manage roles",
		description: "Create, edit and delete custom roles",
		module: "team",
	},
	{
		key: "settings.organization.read",
		name: "View organization settings",
		description: "Read organization info and integrations",
		module: "settings",
	},
	{
		key: "settings.organization.write",
		name: "Manage organization settings",
		description: "Update organization info and integrations",
		module: "settings",
	},
	{
		key: "settings.widget.read",
		name: "View widget settings",
		description: "Read chat widget configuration",
		module: "settings",
	},
	{
		key: "settings.widget.write",
		name: "Manage widget settings",
		description: "Update chat widget appearance and behaviour",
		module: "settings",
	},
	{
		key: "settings.billing.read",
		name: "View billing",
		description: "View plan and subscription details",
		module: "settings",
	},
	{
		key: "settings.billing.write",
		name: "Manage billing",
		description: "Change plan and payment details",
		module: "settings",
	},
] as const;

const SYSTEM_ROLES = [
	{
		id: SYSTEM_ROLE_IDS.OWNER,
		name: "Owner",
		description: "Full access to the organization, teams and billing.",
		scope: "ORGANIZATION" as const,
		permissions: PERMISSIONS.map((permission) => permission.key),
	},
	{
		id: SYSTEM_ROLE_IDS.SUPERADMIN,
		name: "superadmin",
		description: "Full access to the platform administration surface.",
		scope: "PLATFORM" as const,
		permissions: PERMISSIONS.map((permission) => permission.key),
	},
] as const;

export async function seedRoles(prisma: PrismaClient) {
	for (const permission of PERMISSIONS) {
		await prisma.permission.upsert({
			where: { key: permission.key },
			update: permission,
			create: permission,
		});
	}

	const permissions = await prisma.permission.findMany({
		select: { id: true, key: true },
	});
	const permissionIds = new Map(
		permissions.map((permission) => [permission.key, permission.id]),
	);

	await prisma.role.deleteMany({
		where: {
			isSystem: true,
			organizationId: null,
			id: { notIn: SYSTEM_ROLES.map((role) => role.id) },
		},
	});

	for (const role of SYSTEM_ROLES) {
		await prisma.role.upsert({
			where: { id: role.id },
			update: {
				name: role.name,
				description: role.description,
				isSystem: true,
				scope: role.scope,
				organizationId: null,
			},
			create: {
				id: role.id,
				name: role.name,
				description: role.description,
				isSystem: true,
				scope: role.scope,
			},
		});

		const ids = role.permissions
			.map((key) => permissionIds.get(key))
			.filter((id): id is string => Boolean(id));

		await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
		if (ids.length > 0) {
			await prisma.rolePermission.createMany({
				data: ids.map((permissionId) => ({
					roleId: role.id,
					permissionId,
				})),
				skipDuplicates: true,
			});
		}
	}

	return {
		roles: SYSTEM_ROLES.length,
		permissions: PERMISSIONS.length,
	};
}
