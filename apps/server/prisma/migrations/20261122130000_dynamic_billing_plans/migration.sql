CREATE TABLE "plans" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "monthlyPrice" INTEGER NOT NULL DEFAULT 0,
  "annualPrice" INTEGER NOT NULL DEFAULT 0,
  "maxMembers" INTEGER,
  "maxVisitors" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");
CREATE INDEX "plans_isActive_idx" ON "plans"("isActive");

INSERT INTO "plans" ("id", "name", "slug", "description", "created_at", "updated_at")
VALUES
  ('b3a9a2a2-1c8f-4d9a-a68a-000000000001', 'Free', 'free', 'Starter plan for small teams.', NOW(), NOW()),
  ('b3a9a2a2-1c8f-4d9a-a68a-000000000002', 'Starter', 'starter', 'For growing teams.', NOW(), NOW()),
  ('b3a9a2a2-1c8f-4d9a-a68a-000000000003', 'Pro', 'pro', 'For established support teams.', NOW(), NOW()),
  ('b3a9a2a2-1c8f-4d9a-a68a-000000000004', 'Enterprise', 'enterprise', 'For organizations with advanced needs.', NOW(), NOW());

ALTER TABLE "organizations" ADD COLUMN "planId" TEXT;

UPDATE "organizations" o
SET "planId" = p."id"
FROM "plans" p
WHERE lower(p."slug") = lower(o."plan"::text);

ALTER TABLE "organizations" DROP COLUMN "plan";
DROP TYPE "PlanType";

ALTER TABLE "organizations"
  ADD CONSTRAINT "organizations_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "plans"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "organizations_planId_idx" ON "organizations"("planId");
