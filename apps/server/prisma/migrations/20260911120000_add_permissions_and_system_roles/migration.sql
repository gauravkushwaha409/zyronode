-- Permission registry (idempotent, keyed by stable `key`).
-- Previously boot-seeded rows have random ids; they are preserved and linked by key below.
INSERT INTO "permissions" ("id", "key", "name", "description", "module", "created_at", "updated_at")
VALUES
	('0a510eb8-78d1-487f-800a-ace013667e86', 'inbox.read', 'View conversations', 'Read conversations and messages', 'inbox', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('5be936c1-6496-47d7-8089-241700382fb0', 'inbox.write', 'Send messages', 'Send messages and manage conversations', 'inbox', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('2d677f38-eae3-417a-ab30-538fffad2cbb', 'visitors.read', 'View visitors', 'See tracked visitors and their details', 'visitors', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('77e7f75e-cbf4-4b04-b309-6d4b4c636ffd', 'visitors.write', 'Edit visitors', 'Update visitors and change assignment', 'visitors', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('0a9d5a23-e8d1-4742-8b18-69a5d596911c', 'analytics.read', 'View analytics', 'Read metrics and reports', 'analytics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('2d03ce8b-ba6d-4df7-8fba-f4f5f46c58d6', 'team.members.read', 'View members', 'See workspace members', 'team', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('27ba0faf-6c4f-4d15-8fa1-eb2de19fe84a', 'team.members.write', 'Manage members', 'Edit members and their roles', 'team', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('48a668c7-8ec0-4119-a73b-ba2203e0c5e4', 'team.invitations.read', 'View invitations', 'See pending team invitations', 'team', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('675db1a1-2eb2-466e-95f8-b913c0b3e3a7', 'team.invitations.write', 'Manage invitations', 'Invite and revoke team members', 'team', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('a0c0b0a4-b957-4021-90ef-b52a14a406eb', 'team.teams.read', 'View teams', 'See teams/departments', 'team', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('a5784ea5-91fc-4703-a98e-5db5c86060b0', 'team.teams.write', 'Manage teams', 'Create and edit teams', 'team', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('7cf1175f-f5c9-4a66-9879-5bff79ad1a9a', 'team.roles.read', 'View roles', 'See roles and their permissions', 'team', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('612f8cc2-dbd1-43e5-ba98-caba9231e465', 'team.roles.write', 'Manage roles', 'Create, edit and delete custom roles', 'team', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('2afc4baa-b1ba-48c9-91ed-3e1e0704b705', 'settings.organization.read', 'View organization settings', 'Read organization info and integrations', 'settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('5fa013ed-f009-42eb-9024-3f5271322b87', 'settings.organization.write', 'Manage organization settings', 'Update organization info and integrations', 'settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('a141f796-a87c-47e0-97b2-552e467d74f0', 'settings.widget.read', 'View widget settings', 'Read chat widget configuration', 'settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('1742b5ce-fad4-44c4-a961-22b91879dcda', 'settings.widget.write', 'Manage widget settings', 'Update chat widget appearance and behaviour', 'settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('17d6cb89-c59c-4d7f-9cdc-a263404d43b0', 'settings.billing.read', 'View billing', 'View plan and subscription details', 'settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('da9b5829-aaf2-4912-8553-5bc5380c6fcf', 'settings.billing.write', 'Manage billing', 'Change plan and payment details', 'settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- Drop system roles created by the old boot-time seeder (random ids), so the
-- fixed-id roles below stay canonical. Custom org-scoped roles are untouched,
-- and role_permissions rows cascade away.
DELETE FROM "roles"
WHERE "isSystem" = true
	AND "organizationId" IS NULL
	AND "id" NOT IN (
		'f60829d4-5fcd-4ffc-b7a3-744c7fc56c54',
		'8b91d2c2-cad0-4bd5-96ca-a51d5eb76e3a',
		'b86c8680-7aa1-41a2-981e-d8983ae46cc0',
		'02bd4dcf-8ac5-4445-8ac9-811334f4a1c8',
		'd690d10d-72c7-4808-b492-0075c075df6f'
	);

-- System roles (fixed ids, organizationId NULL = platform-wide).
INSERT INTO "roles" ("id", "name", "description", "isSystem", "organizationId", "created_at", "updated_at")
VALUES
	('f60829d4-5fcd-4ffc-b7a3-744c7fc56c54', 'Owner', 'Full access to the organization, teams and billing.', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('8b91d2c2-cad0-4bd5-96ca-a51d5eb76e3a', 'Admin', 'Full access to all settings, teams and billing.', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('b86c8680-7aa1-41a2-981e-d8983ae46cc0', 'Manager', 'Manage teams, members and conversations.', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('02bd4dcf-8ac5-4445-8ac9-811334f4a1c8', 'Agent', 'Handle conversations and visitors.', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
	('d690d10d-72c7-4808-b492-0075c075df6f', 'Viewer', 'Read-only access to analytics and conversations.', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Role-permission matrix, linked by stable permission key.
-- Owner: every permission.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT 'f60829d4-5fcd-4ffc-b7a3-744c7fc56c54', "id" FROM "permissions"
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Admin: every permission.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT '8b91d2c2-cad0-4bd5-96ca-a51d5eb76e3a', "id" FROM "permissions"
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Manager.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT 'b86c8680-7aa1-41a2-981e-d8983ae46cc0', "id" FROM "permissions"
WHERE "key" IN (
	'inbox.read', 'inbox.write',
	'visitors.read', 'visitors.write',
	'analytics.read',
	'team.members.read', 'team.members.write',
	'team.invitations.read', 'team.invitations.write',
	'team.teams.read', 'team.teams.write',
	'team.roles.read',
	'settings.organization.read', 'settings.widget.read', 'settings.billing.read'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Agent.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT '02bd4dcf-8ac5-4445-8ac9-811334f4a1c8', "id" FROM "permissions"
WHERE "key" IN ('inbox.read', 'inbox.write', 'visitors.read', 'visitors.write', 'analytics.read')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Viewer.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT 'd690d10d-72c7-4808-b492-0075c075df6f', "id" FROM "permissions"
WHERE "key" IN ('inbox.read', 'visitors.read', 'analytics.read')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;