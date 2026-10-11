-- AlterTable
ALTER TABLE "call_participants" ADD COLUMN     "visitorId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "calls" ADD COLUMN     "startedByVisitorId" TEXT,
ALTER COLUMN "startedById" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "call_participants_visitorId_idx" ON "call_participants"("visitorId");

-- CreateIndex
CREATE UNIQUE INDEX "call_participants_callId_visitorId_key" ON "call_participants"("callId", "visitorId");

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_startedByVisitorId_fkey" FOREIGN KEY ("startedByVisitorId") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_participants" ADD CONSTRAINT "call_participants_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

