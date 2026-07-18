-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralSource" TEXT,
ADD COLUMN     "theme" TEXT DEFAULT 'light';
