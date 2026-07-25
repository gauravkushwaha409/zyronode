import {
  type DropdownMenuItem,
  DropdownWrapperRadio,
  Icon,
  useDropdownWrapperRadio,
} from '@package/ui';
import type React from 'react';

interface ReplyDropdownProps {
  value: 'reply' | 'notes';
  onValueChange: (value: 'reply' | 'notes') => void;
  onReplyProps?: Pick<React.ComponentProps<typeof DropdownMenuItem>, 'onClick'>;
  onNotesProps?: Pick<React.ComponentProps<typeof DropdownMenuItem>, 'onClick'>;
}

export function ReplyDropdown({
  value,
  onValueChange,
  onNotesProps,
  onReplyProps,
}: ReplyDropdownProps) {
  const dropdown = useDropdownWrapperRadio({
    value,
    onValueChange,
    items: [
      {
        label: 'Reply',
        value: 'reply',
        onClick: onReplyProps?.onClick,
      },
      {
        label: 'Notes(Internal Only)',
        value: 'notes',
        onClick: onNotesProps?.onClick,
      },
    ],
  });

  return (
    <DropdownWrapperRadio
      dropdown={dropdown}
      TriggerButton={(props) => {
        const { className, ...restTriggerProps } = props ?? {};
        return (
          <button
            type="button"
            className="typo-t5 font-medium text-gray-950 bg-linear-to-b from-[#F6F0FF] to-[#FCFAFF] flex items-center gap-x-0.5 pl-2.5 pr-1.5 py-1 rounded-[6px] outline-none"
            {...restTriggerProps}
          >
            {dropdown.selectedItem?.label}
            <Icon name="arrow-down" size={16} className="text-gray-500" />
          </button>
        );
      }}
      dropdownMenuContentProps={{
        className: 'w-2xs',
      }}
    />
  );
}
