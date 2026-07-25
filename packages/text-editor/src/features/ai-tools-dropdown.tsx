import {
  type DropdownMenuItem,
  DropdownWrapper,
  Icon,
  useDropdownWrapper,
} from '@package/ui';
import type React from 'react';

interface AiToolsDropdownProps {
  onFixGrammarClick: Pick<
    React.ComponentProps<typeof DropdownMenuItem>,
    'onClick'
  >;
  onRephraseClick: Pick<
    React.ComponentProps<typeof DropdownMenuItem>,
    'onClick'
  >;
  onElaborateClick: Pick<
    React.ComponentProps<typeof DropdownMenuItem>,
    'onClick'
  >;
  onFriendlyToneClick: Pick<
    React.ComponentProps<typeof DropdownMenuItem>,
    'onClick'
  >;
  onFormalToneClick: Pick<
    React.ComponentProps<typeof DropdownMenuItem>,
    'onClick'
  >;
}

export function AiToolsDropdown({
  onFixGrammarClick,
  onRephraseClick,
  onElaborateClick,
  onFriendlyToneClick,
  onFormalToneClick,
}: AiToolsDropdownProps) {
  const dropdown = useDropdownWrapper({
    items: [
      [
        {
          label: 'Fix grammar',
          value: 'fix-grammar',
          leftIcon: { name: 'fix-grammar' },
          onClick: onFixGrammarClick.onClick,
        },
        {
          label: 'Rephrase',
          value: 'rephrase',
          leftIcon: { name: 'rephrase' },
          onClick: onRephraseClick.onClick,
        },
        {
          label: 'Elaborate',
          value: 'elaborate',
          leftIcon: { name: 'elaborate' },
          onClick: onElaborateClick.onClick,
        },
      ],
      [
        {
          label: 'Make Friendly tone',
          value: 'friendly-tone',
          leftIcon: { name: 'friendly-tone' },
          onClick: onFriendlyToneClick.onClick,
        },
        {
          label: 'Make formal tone',
          value: 'formal-tone',
          leftIcon: { name: 'formal-tone' },
          onClick: onFormalToneClick.onClick,
        },
      ],
    ],
  });

  return (
    <DropdownWrapper
      dropdown={dropdown}
      TriggerButton={(props) => {
        const { className, ...restTriggerProps } = props ?? {};
        return (
          <button
            type="button"
            className="typo-t5 font-medium text-primary-600 flex items-center gap-x-0.5 px-2.5 py-1 rounded-[6px] outline-none"
            {...restTriggerProps}
          >
            AI Tools
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
