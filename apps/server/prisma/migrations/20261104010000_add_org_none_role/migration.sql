-- Explicit organization-level NONE role: a member with no workspace permissions.
INSERT INTO "roles" ("id", "name", "description", "isSystem", "organizationId", "created_at", "updated_at")
VALUES (
	'e3b1a9c7-5d2f-4a6b-8c1e-9f0d2b3a4c5d',
	'None',
	'No organization permissions.',
	true,
	NULL,
	CURRENT_TIMESTAMP,
	CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- Materialize the previous implicit "no role" state as NONE.
UPDATE "organization_members"
SET "roleId" = 'e3b1a9c7-5d2f-4a6b-8c1e-9f0d2b3a4c5d'
WHERE "roleId" IS NULL;

UPDATE "team_invitations"
SET "roleId" = 'e3b1a9c7-5d2f-4a6b-8c1e-9f0d2b3a4c5d'
WHERE "roleId" IS NULL;
