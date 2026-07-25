import { Avatar, Icon, Typography } from '@package/ui';
import { cn } from '@package/ui';
import { formatDistanceToNowStrict } from 'date-fns';
import { useConversationItem } from '../../hooks';
import type { InboxSessionListItem } from '../../types/inbox-api.types';

type ConversationListItemProps = InboxSessionListItem;

export function ConversationListItem(props: ConversationListItemProps) {
  const { value: selectedId, onChange: selectConversation } = useConversationItem();
  const isSelected = selectedId === props.id;

  const senderLabel =
    props.lastMessage?.senderType === 'VISITOR'
      ? props.visitorName ?? 'Visitor'
      : props.lastMessage?.senderType === 'AGENT'
        ? 'Agent'
        : 'System';

  return (
    <button
      type="button"
      onClick={() => selectConversation(props.id)}
      className={cn(
        'w-full px-3 py-3.5 flex items-center gap-x-2.5 rounded-lg transition-colors cursor-pointer',
        isSelected ? 'bg-primary-50' : 'hover:bg-gray-50',
      )}
    >
      <div className="size-11 relative rounded-full shrink-0">
        <Avatar
          className="shrink-0"
          size="xl"
          fallbackType="text"
          fallbackText={props.visitorName?.charAt(0) ?? 'U'}
        />
        {props.status === 'ACTIVE' && (
          <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-white rounded-full" />
        )}
        <Icon
          size={16}
          name="messenger"
          className="absolute left-0 -translate-x-1/2 top-0 border-2 border-white rounded-full"
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center gap-x-2.5 justify-between">
          <div className="flex items-center gap-2.5">
            <Typography.T3 weight="semibold" className="text-gray-950 truncate">
              {props.visitorName ?? 'Unknown Visitor'}
            </Typography.T3>
          </div>
          <div className="flex items-center gap-x-2">
            <Typography.T6>
              {formatDistanceToNowStrict(new Date(props.lastMessageAt), { addSuffix: false })
                .replace(/ seconds?/, 's')
                .replace(/ minutes?/, 'm')
                .replace(/ hours?/, 'h')
                .replace(/ days?/, 'd')
                .replace(/ months?/, 'mo')
                .replace(/ years?/, 'y')}
            </Typography.T6>
            {props.unreadCount > 0 && (
              <div className="size-1.5 bg-primary-500 drop-shadow-[0_3px_22.5px_rgba(0,0,0,0.04)] backdrop-blur-[18px] rounded-full" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-x-2.5">
          <Typography.T5 className="text-gray-500 line-clamp-1">
            {props.lastMessage
              ? `${senderLabel}: ${props.lastMessage.content}`
              : 'No messages yet'}
          </Typography.T5>
        </div>
      </div>
    </button>
  );
}
