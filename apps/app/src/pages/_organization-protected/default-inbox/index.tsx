import { Conversation, ConversationDetails, ConversationList, InboxLayout } from '@/features/default-inbox';
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
      </InboxSocketProvider>
    </InboxSseProvider>
  );
}
