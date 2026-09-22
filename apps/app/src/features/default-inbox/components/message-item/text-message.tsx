import {
  Button,
  type DropdownItem,
  DropdownWrapper,
  Typography,
  useDropdownWrapper,
} from '@package/ui';
import { useState } from 'react';
import { useIsOwnMessage } from '../../hooks';
import {
  useMessageDeleteStore,
  useMessageEditStore,
  useMessageReplyStore,
} from '../../store';
import type { ConversationMessageTypes } from '../../types';
import { formatMessageTime } from '../../utility';

interface TextMessageProps {
  message: ConversationMessageTypes.ConversationMessage;
}

export function TextMessage({ message }: TextMessageProps) {
  if (message.sender_type === 'visitor') {
    return <VisitorTextMessage message={message} />;
  }
  return <AgentTextMessage message={message} />;
}

function AgentTextMessage({ message }: TextMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const time = formatMessageTime(new Date(message.created_at));

  const { setMessage: setEditMessage, isEditing } = useMessageEditStore();
  const { setMessage: setDeleteMessage } = useMessageDeleteStore();
  const { setMessage: setReplyMessage, isReplying } = useMessageReplyStore();
  const isOwnMessage = useIsOwnMessage(message.sender.id);

  const editItem: DropdownItem = {
    label: 'Edit',
    leftIcon: { name: 'tickets' },
    value: 'edit',
    onClick: () => setEditMessage(message),
  };
  const deleteItem: DropdownItem = {
    label: 'Delete',
    leftIcon: { name: 'delete', className: 'text-alert-500' },
    value: 'delete',
    className: 'text-alert-500',
    variant: 'danger',
    onClick: () => setDeleteMessage(message),
    disabled: isEditing(message.uuid) || isReplying(message.uuid),
  };

  const messageActionDropdown = useDropdownWrapper({
    items: [
      [
        {
          label: 'Reply',
          leftIcon: { name: 'reply' },
          value: 'reply',
          onClick: () => setReplyMessage(message),
        },
        ...(isOwnMessage ? [editItem] : []),
      ],
      ...(isOwnMessage ? [[deleteItem]] : []),
    ],
  });

  const isMenuVisible = isHovered || messageActionDropdown.open;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-x-2.5"
    >
      {isMenuVisible && (
        <div className="flex items-center gap-x-0.5">
          <DropdownWrapper
            dropdown={messageActionDropdown}
            TriggerButton={(props) => {
              const { className, ...restTriggerProps } = props;
              return (
                <Button
                  icon="vertical-3-dot-menu"
                  variant="ghost"
                  size="icon-xs"
                  className="bg-primary-100 hover:bg-primary-200 border-none"
                  {...restTriggerProps}
                />
              );
            }}
            dropdownMenuContentProps={{
              className: 'w-60',
            }}
          />
        </div>
      )}

      <div className="max-w-sm px-3 py-2 flex flex-col gap-y-1 justify-between rounded-t-[6px] rounded-br-[6px] rounded-tr-[6px] bg-primary-400 shadow-[0_1px_10px_0_rgba(0,0,0,0.02)]">
        <div
          dangerouslySetInnerHTML={{ __html: message.content ?? '' }}
          className="typo-t4 font-medium text-white"
        />

        {message.reply_to && (
          <div className="py-1.5 flex items-stretch gap-x-3">
            <div className="w-px bg-primary-300" />
            <div
              dangerouslySetInnerHTML={{ __html: message.reply_to.content ?? '' }}
              className="typo-t4 font-medium text-white"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-x-0.75">
          {message.is_edited && (
            <Typography.Cap className="text-primary-100" weight="medium">
              Edited ·
            </Typography.Cap>
          )}
          <Typography.Cap className="text-primary-100" weight="medium">
            Seen
          </Typography.Cap>
          <div className="w-0.75 h-0.75 rounded-full bg-primary-100" />
          <Typography.Cap className="text-primary-100" weight="medium">
            {time}
          </Typography.Cap>
        </div>
      </div>
    </div>
  );
}

function VisitorTextMessage({ message }: TextMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const time = formatMessageTime(new Date(message.created_at));
  const { setMessage: setReplyMessage } = useMessageReplyStore();

  const messageActionDropdown = useDropdownWrapper({
    items: [
      [
        {
          label: 'Reply',
          leftIcon: { name: 'reply' },
          value: 'reply',
          onClick: () => setReplyMessage(message),
        },
      ],
    ],
  });

  const isMenuVisible = isHovered || messageActionDropdown.open;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-x-2.5"
    >
      <div className="max-w-sm px-3 py-2 flex flex-col gap-y-1 justify-between rounded-t-[6px] rounded-br-[6px] rounded-tr-[6px] bg-white text-gray-800 shadow-[0_1px_10px_0_rgba(0,0,0,0.02)]">
        <div
          dangerouslySetInnerHTML={{ __html: message.content ?? '' }}
          className="typo-t4 font-medium text-gray-800"
        />

        {message.reply_to && (
          <div className="py-1.5 flex items-stretch gap-x-3">
            <div className="w-px bg-primary-300" />
            <div
              dangerouslySetInnerHTML={{ __html: message.reply_to.content ?? '' }}
              className="typo-t4 font-medium text-gray-800"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-x-0.75">
          <Typography.Cap className="text-gray-400" weight="medium">
            {time}
          </Typography.Cap>
        </div>
      </div>

      {isMenuVisible && (
        <div className="flex items-center gap-x-0.5">
          <DropdownWrapper
            dropdown={messageActionDropdown}
            TriggerButton={(props) => {
              const { className, ...restTriggerProps } = props;
              return (
                <Button
                  icon="vertical-3-dot-menu"
                  variant="ghost"
                  size="icon-xs"
                  className="bg-primary-100 hover:bg-primary-200 border-none"
                  {...restTriggerProps}
                />
              );
            }}
            dropdownMenuContentProps={{
              className: 'w-60',
            }}
          />
        </div>
      )}
    </div>
  );
}
