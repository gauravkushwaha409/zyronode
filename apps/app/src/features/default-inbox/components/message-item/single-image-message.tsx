import { Typography } from '@package/ui';
import { format, parseISO } from 'date-fns';
import type { ConversationMessageTypes } from '../../types';

interface SingleImageMessageProps {
  message: ConversationMessageTypes.ConversationMessage;
}

export function SingleImageMessage({ message }: SingleImageMessageProps) {
  return (
    <div className="p-0.5 rounded-t-[6px] rounded-bl-[6px] w-62.5 bg-primary-400">
      <div className="rounded-lg p-1 backdrop-blur-[15px] bg-white/15">
        <img
          src={message?.attachments?.[0]?.url}
          alt={message?.attachments?.[0]?.filename}
          className="w-full h-40 object-cover"
        />
      </div>
      <div className="p-2 flex flex-col gap-y-1.5">
        <Typography.T4 weight="medium" className="text-white">
          Image attachment
        </Typography.T4>
        <div className="self-end">
          <Typography.Cap weight="medium" className="text-primary-100">
            {message.status === 'read' && 'Seen'}
            {message.status === 'read' && ' . '}
            {format(parseISO(message.created_at), 'h:mm a')}
          </Typography.Cap>
        </div>
      </div>
    </div>
  );
}
