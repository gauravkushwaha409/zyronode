import { Conversation, ConversationDetails, ConversationList, InboxLayout } from '@/features/default-inbox';

interface DefaultInboxPageProps {
  organizationId: string;
}

export function DefaultInboxPage({ organizationId }: DefaultInboxPageProps) {
  return (
    <InboxLayout>
      <ConversationList organizationId={organizationId} />
      <Conversation organizationId={organizationId} />
      <ConversationDetails />
    </InboxLayout>
  );
}
