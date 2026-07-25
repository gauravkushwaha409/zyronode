import { Conversation, ConversationDetails, ConversationList, InboxLayout } from '@/features/default-inbox';

export function DefaultInboxPage() {
  return (
    <InboxLayout>
      <ConversationList />
      <Conversation />
      <ConversationDetails />
    </InboxLayout>
  );
}
