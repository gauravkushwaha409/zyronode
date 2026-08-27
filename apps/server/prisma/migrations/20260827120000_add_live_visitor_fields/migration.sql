-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "visitorId" TEXT;
-- AlterTable
ALTER TABLE "visitors" ADD COLUMN     "activeDuration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "assignedAgentId" TEXT,
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "currentPage" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "isIdentified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "regionName" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "visitCount" INTEGER NOT NULL DEFAULT 1;
-- CreateTable
CREATE TABLE "visitor_notes" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "authorId" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "visitor_notes_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "visitor_page_visits" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pageTitle" TEXT,
    "entered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visitor_page_visits_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "visitor_notes_visitorId_idx" ON "visitor_notes"("visitorId");
-- CreateIndex
CREATE INDEX "visitor_notes_visitorId_created_at_idx" ON "visitor_notes"("visitorId", "created_at" DESC);
-- CreateIndex
CREATE INDEX "visitor_page_visits_visitorId_idx" ON "visitor_page_visits"("visitorId");
-- CreateIndex
CREATE INDEX "visitor_page_visits_visitorId_entered_at_idx" ON "visitor_page_visits"("visitorId", "entered_at" DESC);
-- CreateIndex
CREATE INDEX "conversations_visitorId_idx" ON "conversations"("visitorId");
-- CreateIndex
CREATE INDEX "visitors_organizationId_isOnline_idx" ON "visitors"("organizationId", "isOnline");
-- CreateIndex
CREATE INDEX "visitors_organizationId_lastSeenAt_idx" ON "visitors"("organizationId", "lastSeenAt" DESC);
-- CreateIndex
CREATE UNIQUE INDEX "visitors_organizationId_externalId_key" ON "visitors"("organizationId", "externalId");
-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "visitor_notes" ADD CONSTRAINT "visitor_notes_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "visitor_notes" ADD CONSTRAINT "visitor_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "visitor_page_visits" ADD CONSTRAINT "visitor_page_visits_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
