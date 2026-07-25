import { Typography } from '@package/ui';
import { useConversationItem } from '../../hooks';
import { ConversationBody } from '../conversation-body';
import { ConversationHeader } from './conversation-header';

export function Conversation() {
  const { value: conversationUUID } = useConversationItem();

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
      <ConversationHeader conversationUUID={conversationUUID} />
      <ConversationBody conversationUUID={conversationUUID} />
    </div>
  );
}
