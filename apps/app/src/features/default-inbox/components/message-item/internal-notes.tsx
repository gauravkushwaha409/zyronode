import { Button, Typography } from '@package/ui';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import type { ConversationMessageTypes } from '../../types';

interface InternalNotesMessageItemProps {
  message: ConversationMessageTypes.ConversationMessage;
}

export function InternalNotesMessageItem({ message }: InternalNotesMessageItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-x-2.5"
    >
      {isHovered && (
        <div className="flex items-center gap-x-0.5">
          <Button
            icon="vertical-3-dot-menu"
            variant="ghost"
            size="icon-xs"
            className="bg-warning-100 hover:bg-warning-200 border-none"
          />
        </div>
      )}

      <div className="bg-warning-50 rounded-t-[6px] rounded-bl-[6px] px-3 py-2 space-y-1.5 shadow-[-3px_-3px_0_0_rgba(220,104,3,0.20)]">
        <div
          className="typo-t4 font-medium text-gray-950"
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
        <div className="w-full flex items-center justify-end">
          <Typography.Cap weight="medium" className="text-warning-600">
            {format(parseISO(message.created_at), 'h:mm a')}
          </Typography.Cap>
        </div>
      </div>
    </div>
  );
}
