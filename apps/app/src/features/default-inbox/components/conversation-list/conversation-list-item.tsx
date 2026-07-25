import { Avatar, Icon, Typography } from '@package/ui';
import { cn } from '@package/ui';
import { formatDistanceToNowStrict } from 'date-fns';
import { useConversationItem } from '../../hooks';
import type { ConversationListTypes } from '../../types';

interface ConversationListItemProps extends ConversationListTypes.ConversationListItem {}

export function ConversationListItem(props: ConversationListItemProps) {
  const { value: selectedId, onChange: selectConversation } = useConversationItem();
  const isSelected = selectedId === props.uuid;

  return (
    <button
      type="button"
      onClick={() => selectConversation(props.uuid)}
      className={cn(
        'w-full px-3 py-3.5 flex items-center gap-x-2.5 rounded-lg transition-colors cursor-pointer',
        isSelected ? 'bg-primary-50' : 'hover:bg-gray-50',
      )}
    >
      <div className="size-11 relative rounded-full shrink-0">
        {props?.visitor?.name ? (
          <Avatar
            className="shrink-0"
            size="xl"
            fallbackType="text"
            fallbackText={props?.visitor?.name?.charAt(0) ?? 'U'}
          />
        ) : (
          <Avatar className="shrink-0" size="xl" fallbackType="icon" />
        )}
        <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-white rounded-full" />
        <Icon
          size={14}
          name="vip"
          className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 rounded-full"
        />
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
              {props?.visitor?.name ?? 'Unknown'}
            </Typography.T3>
          </div>
          <div className="flex items-center gap-x-2">
            <Typography.T6>
              {formatDistanceToNowStrict(new Date(props.last_message_at), { addSuffix: false })
                .replace(/ seconds?/, 's')
                .replace(/ minutes?/, 'm')
                .replace(/ hours?/, 'h')
                .replace(/ days?/, 'd')
                .replace(/ months?/, 'mo')
                .replace(/ years?/, 'y')}
            </Typography.T6>
            {props.unread_count_agent > 0 && (
              <div className="size-1.5 bg-primary-500 drop-shadow-[0_3px_22.5px_rgba(0,0,0,0.04)] backdrop-blur-[18px] rounded-full" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-x-2.5">
          <Typography.T5
            className="text-gray-500 line-clamp-1"
            dangerouslySetInnerHTML={{ __html: props.last_message_snippet ?? 'No message yet' }}
          />
          {props?.ai_status ? (
            <Icon name="chatboq-ai" size={16} />
          ) : (
            <Icon name="assignee" size={16} />
          )}
        </div>
      </div>
    </button>
  );
}
