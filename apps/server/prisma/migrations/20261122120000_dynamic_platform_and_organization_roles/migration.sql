-- Replace the fixed platform-role enum with database-backed roles.
CREATE TYPE "RoleScope" AS ENUM ('PLATFORM', 'ORGANIZATION');

ALTER TABLE "roles"
  ADD COLUMN "scope" "RoleScope" NOT NULL DEFAULT 'ORGANIZATION';

ALTER TABLE "User"
  ADD COLUMN "platformRoleId" TEXT;

CREATE INDEX "User_platformRoleId_idx" ON "User"("platformRoleId");

-- Preserve the existing super-admin account during the transition.
INSERT INTO "roles" ("id", "name", "description", "isSystem", "scope", "created_at", "updated_at")
VALUES (
  '9e0a6e77-0c7f-4b4d-8a43-9c2d7a4b1f30',
  'superadmin',
  'Full access to the platform administration surface.',
  true,
  'PLATFORM',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "isSystem" = true,
  "scope" = 'PLATFORM';

INSERT INTO "roles" ("id", "name", "description", "isSystem", "scope", "created_at", "updated_at")
VALUES (
  'f60829d4-5fcd-4ffc-b7a3-744c7fc56c54',
  'Owner',
  'Full access to the organization, teams and billing.',
  true,
  'ORGANIZATION',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "isSystem" = true,
  "scope" = 'ORGANIZATION';

UPDATE "User"
SET "platformRoleId" = '9e0a6e77-0c7f-4b4d-8a43-9c2d7a4b1f30'
WHERE "platformRole" = 'SUPER_ADMIN';

-- Other enum values no longer grant platform access. They can be recreated as
-- normal database roles by an administrator if needed.
ALTER TABLE "User" DROP COLUMN "platformRole";
DROP TYPE "PlatformRole";

ALTER TABLE "User"
  ADD CONSTRAINT "User_platformRoleId_fkey"
  FOREIGN KEY ("platformRoleId") REFERENCES "roles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- The only seeded system roles are the platform superadmin and organization owner.
DELETE FROM "roles"
WHERE "isSystem" = true
  AND "id" NOT IN (
    '9e0a6e77-0c7f-4b4d-8a43-9c2d7a4b1f30',
    'f60829d4-5fcd-4ffc-b7a3-744c7fc56c54'
  );
