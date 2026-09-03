import { Button, DropdownWrapper, useDropdownWrapper } from '@package/ui';
import { useState } from 'react';

export function ConversationAction({
  triggerIconProps,
  conversationId,
}: {
  triggerIconProps?: Pick<React.ComponentProps<typeof Button>, 'size' | 'icon'>;
  conversationId?: string;
}) {
  const [isSnoozed] = useState(false);
  const [isBanned] = useState(false);
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);

  const dropdown = useDropdownWrapper({
    items: [
      {
        label: isSnoozed ? 'Unsnooze' : 'Snooze',
        value: 'snooze',
        leftIcon: { name: 'time' },
        onClick: () => setIsSnoozeOpen((v) => !v),
      },
      {
        label: isBanned ? 'Unban Visitor' : 'Ban Visitor',
        value: 'ban-ip',
        leftIcon: { name: 'ban-visitor' },
        onClick: () => {},
      },
      {
        label: 'Move to inbox',
        value: 'move-to-inbox',
        leftIcon: { name: 'inbox' },
        onClick: () => {},
      },
    ],
  });

  // conversationId is available for wiring mutations without duplicating logic
  void conversationId;

  return (
    <div className="relative">
      <DropdownWrapper
        dropdown={dropdown}
        TriggerButton={({ isOpen }) => (
          <Button
            icon={triggerIconProps?.icon || 'vertical-3-dot-menu'}
            variant="ghost"
            size={triggerIconProps?.size || 'icon-lg'}
            aria-expanded={isOpen}
          />
        )}
      />
      {isSnoozeOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border bg-white p-4 shadow-lg">
          <p className="typo-t3 font-medium">Snooze conversation</p>
          <p className="typo-t5 text-gray-500 mt-1">Pick duration and confirm.</p>
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="secondary" size="xs" onClick={() => setIsSnoozeOpen(false)}>Cancel</Button>
            <Button size="xs" onClick={() => setIsSnoozeOpen(false)}>Confirm</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Back-compat alias — will be removed after migration
export const ConversationHeaderAction = ConversationAction;
