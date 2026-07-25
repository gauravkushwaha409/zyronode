import { Avatar } from '@package/ui';
import type { ConversationMessageTypes } from '../../types';
import type { MessageCluster as MessageClusterType } from '../../utility';
import { InternalNotesMessageItem } from '../message-item/internal-notes';
import { TextMessage } from '../message-item/text-message';

interface MessageClusterProps {
  cluster: MessageClusterType;
}

export function MessageCluster({ cluster }: MessageClusterProps) {
  const isVisitor = cluster.senderType === 'visitor';

  return (
    <div className={`flex items-start gap-x-2.5 ${isVisitor ? 'self-start' : 'self-end flex-row-reverse'}`}>
      <div className="relative shrink-0">
        <Avatar
          size="default"
          fallbackType="icon"
          image={cluster.sender.avatar ?? undefined}
          className={cluster.sender.bg_color ? `bg-[${cluster.sender.bg_color}]` : undefined}
        />
        <div className="size-2 rounded-full bg-success-200 absolute bottom-0 right-0 border border-white" />
      </div>

      <div className={`flex flex-col gap-y-1 ${isVisitor ? '' : 'items-end'}`}>
        {cluster.messages.map((message) => (
          <MessageContent key={message.uuid} message={message} />
        ))}
      </div>
    </div>
  );
}

function MessageContent({ message }: { message: ConversationMessageTypes.ConversationMessage }) {
  const isVisitor = message.sender_type === 'visitor';
  const isAgent = message.sender_type === 'agent';

  return (
    <>
      {isAgent && message.message_type === 'text' && <TextMessage message={message} />}
      {isAgent && message.message_type === 'internal_note' && <InternalNotesMessageItem message={message} />}
      {isVisitor && <TextMessage message={message} />}
    </>
  );
}
