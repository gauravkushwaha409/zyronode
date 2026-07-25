import {
  Button,
  type DropdownMenuItem,
  DropdownWrapper,
  useDropdownWrapper,
} from '@package/ui';
import type React from 'react';

interface ReplyMenuPopoverProps {
  requestEmail: Pick<React.ComponentProps<typeof DropdownMenuItem>, 'onClick'>;
  workUpdate: Pick<React.ComponentProps<typeof DropdownMenuItem>, 'onClick'>;
  requestFeedback: Pick<
    React.ComponentProps<typeof DropdownMenuItem>,
    'onClick'
  >;
  sendEmoji: Pick<React.ComponentProps<typeof DropdownMenuItem>, 'onClick'>;
  addAttachment: Pick<React.ComponentProps<typeof DropdownMenuItem>, 'onClick'>;
  knowledgeBase: Pick<React.ComponentProps<typeof DropdownMenuItem>, 'onClick'>;
  autoComplete: Pick<React.ComponentProps<typeof DropdownMenuItem>, 'onClick'>;
  shortcuts: Pick<React.ComponentProps<typeof DropdownMenuItem>, 'onClick'>;
}

export function ReplyMenuPopover({
  addAttachment,
  requestEmail,
  workUpdate,
  requestFeedback,
  sendEmoji,
  knowledgeBase,
  autoComplete,
  shortcuts,
}: ReplyMenuPopoverProps) {
  const dropdown = useDropdownWrapper({
    items: [
      {
        label: 'Request email',
        value: 'request-email',
        leftIcon: { name: 'email' },
        shortcut: '⌘+S+F',
        onClick: requestEmail.onClick,
      },
      {
        label: 'Work update',
        value: 'work-update',
        leftIcon: { name: 'status-update' },
        shortcut: '⌘+U',
        onClick: workUpdate.onClick,
      },
      {
        label: 'Request feedback',
        value: 'request-feedback',
        leftIcon: { name: 'feedback' },
        shortcut: '⌘+F',
        onClick: requestFeedback.onClick,
      },
      {
        label: 'Send emoji',
        value: 'send-emoji',
        leftIcon: { name: 'send-emojis' },
        shortcut: '⌘+E',
        onClick: sendEmoji.onClick,
      },
      {
        label: 'Add attachment',
        value: 'add-attachment',
        leftIcon: { name: 'add-attatchments' },
        onClick: addAttachment.onClick,
      },
      {
        label: 'Knowledge base',
        value: 'knowledge-base',
        leftIcon: { name: 'support-library' },
        shortcut: '⌘+K',
        onClick: knowledgeBase.onClick,
      },
      {
        label: 'Auto complete',
        value: 'auto-complete',
        leftIcon: { name: 'auto-complete' },
        shortcut: '⌘+A',
        onClick: autoComplete.onClick,
      },
      {
        label: 'Shortcuts',
        value: 'shortcuts',
        leftIcon: { name: 'shortcuts' },
        shortcut: '⌘+/',
        onClick: shortcuts.onClick,
      },
    ],
  });
  return (
    <DropdownWrapper
      dropdown={dropdown}
      TriggerButton={(props) => {
        const { className, ...restTriggerProps } = props ?? {};
        return (
          <Button
            icon="reply-menu"
            size="icon-sm"
            variant="ghost"
            {...restTriggerProps}
          />
        );
      }}
      dropdownMenuContentProps={{
        className: 'w-2xs',
      }}
    />
  );
}
