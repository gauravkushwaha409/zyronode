-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('NONE', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "platformRole" "PlatformRole" NOT NULL DEFAULT 'NONE';

-- CreateIndex
CREATE INDEX "User_platformRole_idx" ON "User"("platformRole");
