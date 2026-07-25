import { Typography } from '@package/ui';
import { useConversationItem, useInboxSessionDetailQuery } from '../../hooks';
import { ConversationBody } from '../conversation-body';
import { ConversationHeader } from './conversation-header';

interface ConversationProps {
  organizationId: string;
}

export function Conversation({ organizationId }: ConversationProps) {
  const { value: conversationUUID } = useConversationItem();

  const { data: sessionData } = useInboxSessionDetailQuery(conversationUUID, organizationId);
  const session = sessionData?.data?.data;

  if (!conversationUUID) {
    return (
      <div className="flex items-center justify-center h-full">
        <Typography.T3 className="text-gray-400">
          Select a conversation
        </Typography.T3>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-active-1 inbox-bg-dot-grid">
      <ConversationHeader
        conversationUUID={conversationUUID}
        visitorName={session?.visitorName ?? null}
        channel={session?.channel ?? null}
        status={session?.status ?? null}
      />
      <ConversationBody conversationUUID={conversationUUID} organizationId={organizationId} />
    </div>
  );
}
