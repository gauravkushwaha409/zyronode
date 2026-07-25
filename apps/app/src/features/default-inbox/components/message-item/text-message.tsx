import { Button, Typography } from '@package/ui';
import { useState } from 'react';
import type { ConversationMessageTypes } from '../../types';
import { formatMessageTime } from '../../utility';

interface TextMessageProps {
  message: ConversationMessageTypes.ConversationMessage;
}

export function TextMessage({ message }: TextMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isVisitor = message.sender_type === 'visitor';
  const time = formatMessageTime(new Date(message.created_at));

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-x-2.5"
    >
      {!isVisitor && isHovered && (
        <div className="flex items-center gap-x-0.5">
          <Button
            icon="vertical-3-dot-menu"
            variant="ghost"
            size="icon-xs"
            className="bg-primary-100 hover:bg-primary-200 border-none"
          />
        </div>
      )}

      <div
        className={`max-w-sm px-3 py-2 flex flex-col gap-y-1 justify-between rounded-t-[6px] rounded-br-[6px] rounded-tr-[6px] ${isVisitor ? 'bg-white text-gray-800' : 'bg-primary-400'} shadow-[0_1px_10px_0_rgba(0,0,0,0.02)]`}
      >
        <div
          dangerouslySetInnerHTML={{ __html: message.content ?? '' }}
          className={`typo-t4 font-medium ${isVisitor ? 'text-gray-800' : 'text-white'}`}
        />

        {message.reply_to && (
          <div className="py-1.5 flex items-stretch gap-x-3">
            <div className="w-px bg-primary-300" />
            <div
              dangerouslySetInnerHTML={{ __html: message.reply_to.content ?? '' }}
              className={`typo-t4 font-medium ${isVisitor ? 'text-gray-800' : 'text-white'}`}
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-x-0.75">
          {isVisitor ? (
            <Typography.Cap className="text-gray-400" weight="medium">
              {time}
            </Typography.Cap>
          ) : (
            <>
              <Typography.Cap className="text-primary-100" weight="medium">
                Seen
              </Typography.Cap>
              <div className="w-0.75 h-0.75 rounded-full bg-primary-100" />
              <Typography.Cap className="text-primary-100" weight="medium">
                {time}
              </Typography.Cap>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
