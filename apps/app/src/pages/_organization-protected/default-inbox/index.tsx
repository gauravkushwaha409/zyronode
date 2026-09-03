import { Conversation, ConversationDetails, ConversationList, InboxLayout } from '@/features/default-inbox';
import { DeleteConversationDialog } from '@/features/default-inbox/components/conversation/delete-conversation-dialog';
import { InboxSocketProvider } from '@/features/default-inbox/providers';
import { InboxSseProvider } from '@/features/sse';

interface DefaultInboxPageProps {
  organizationId: string;
}

export function DefaultInboxPage({ organizationId }: DefaultInboxPageProps) {
  return (
    <InboxSseProvider organizationId={organizationId}>
      <InboxSocketProvider organizationId={organizationId}>
        <InboxLayout>
          <ConversationList organizationId={organizationId} />
          <Conversation organizationId={organizationId} />
          <ConversationDetails />
        </InboxLayout>
        <DeleteConversationDialog />
      </InboxSocketProvider>
    </InboxSseProvider>
  );
}
