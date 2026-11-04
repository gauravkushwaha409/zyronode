-- Platform roles: SUPER_ADMIN, ADMIN, MANAGER (plus NONE for no access).
-- Rebuild the enum because PostgreSQL cannot drop an enum value in place.
ALTER TYPE "PlatformRole" RENAME TO "PlatformRole_old";
CREATE TYPE "PlatformRole" AS ENUM ('NONE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN');
ALTER TABLE "User" ALTER COLUMN "platformRole" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "platformRole" TYPE "PlatformRole"
USING (
	CASE "platformRole"::text
		WHEN 'SUPPORT' THEN 'MANAGER'::"PlatformRole"
		ELSE "platformRole"::text::"PlatformRole"
	END
);
ALTER TABLE "User" ALTER COLUMN "platformRole" SET DEFAULT 'NONE';
DROP TYPE "PlatformRole_old";

-- Organization roles: Owner, Manager, Agent.
-- Preserve existing assignments by moving Admin -> Manager and Viewer -> Agent.
UPDATE "organization_members"
SET "roleId" = 'b86c8680-7aa1-41a2-981e-d8983ae46cc0'
WHERE "roleId" = '8b91d2c2-cad0-4bd5-96ca-a51d5eb76e3a';

UPDATE "team_invitations"
SET "roleId" = 'b86c8680-7aa1-41a2-981e-d8983ae46cc0'
WHERE "roleId" = '8b91d2c2-cad0-4bd5-96ca-a51d5eb76e3a';

UPDATE "organization_members"
SET "roleId" = '02bd4dcf-8ac5-4445-8ac9-811334f4a1c8'
WHERE "roleId" = 'd690d10d-72c7-4808-b492-0075c075df6f';

UPDATE "team_invitations"
SET "roleId" = '02bd4dcf-8ac5-4445-8ac9-811334f4a1c8'
WHERE "roleId" = 'd690d10d-72c7-4808-b492-0075c075df6f';

DELETE FROM "roles"
WHERE "id" IN (
	'8b91d2c2-cad0-4bd5-96ca-a51d5eb76e3a',
	'd690d10d-72c7-4808-b492-0075c075df6f'
);
