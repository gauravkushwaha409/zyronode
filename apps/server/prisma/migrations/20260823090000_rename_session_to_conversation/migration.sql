-- RenameEnum
ALTER TYPE "SessionStatus" RENAME TO "ConversationStatus";

-- RenameTable
ALTER TABLE "sessions" RENAME TO "conversations";

-- RenameColumn
ALTER TABLE "messages" RENAME COLUMN "sessionId" TO "conversationId";

-- RenamePrimaryKeyAndForeignKeyOfConversations
ALTER TABLE "conversations" RENAME CONSTRAINT "sessions_pkey" TO "conversations_pkey";
ALTER TABLE "conversations" RENAME CONSTRAINT "sessions_organizationId_fkey" TO "conversations_organizationId_fkey";

-- RenameIndexes
ALTER INDEX "sessions_organizationId_idx" RENAME TO "conversations_organizationId_idx";
ALTER INDEX "sessions_organizationId_status_idx" RENAME TO "conversations_organizationId_status_idx";
ALTER INDEX "sessions_organizationId_updated_at_idx" RENAME TO "conversations_organizationId_updated_at_idx";
ALTER INDEX "messages_sessionId_idx" RENAME TO "messages_conversationId_idx";
ALTER INDEX "messages_sessionId_created_at_idx" RENAME TO "messages_conversationId_created_at_idx";
ALTER TABLE "messages" RENAME CONSTRAINT "messages_sessionId_fkey" TO "messages_conversationId_fkey";
