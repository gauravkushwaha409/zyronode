import type React from 'react';
import type {
  DropdownCheckboxItem,
  DropdownWrapperCheckboxApi,
} from '../../hooks/use-dropdown-wrapper-checkbox';
import { Icon } from '../icons';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '../shadcn/dropdown-menu';

export interface TriggerButtonCheckboxProps<T extends string>
  extends React.ComponentProps<'button'> {
  selectedItems: DropdownCheckboxItem<T>[];
  isOpen: boolean;
}

interface DropdownWrapperCheckboxProps<T extends string> {
  dropdown: DropdownWrapperCheckboxApi<T>;
  TriggerButton: React.ComponentType<TriggerButtonCheckboxProps<T>>;
  contentClassName?: string;
}

export function DropdownWrapperCheckbox<T extends string>({
  dropdown,
  TriggerButton,
  contentClassName,
}: DropdownWrapperCheckboxProps<T>) {
  const { items, currentValues, selectedItems, onChange, open, setOpen } =
    dropdown;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="w-fit shrink-0" asChild>
        <TriggerButton selectedItems={selectedItems} isOpen={open} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className={contentClassName}>
        <DropdownMenuGroup className='space-y-0.5'>
          {items.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.value}
              checked={currentValues.includes(item.value)}
              onCheckedChange={() => onChange(item.value)}
            >
              <div className='w-full flex items-center justify-between'>
                <div className='flex items-center gap-x-2.5'>
                  {item.leftIcon && (
                    <DropdownMenuShortcut>
                      <Icon {...item.leftIcon} />
                    </DropdownMenuShortcut>
                  )}
                  {item.label}
                </div>
                {item.rightIcon && (
                  <DropdownMenuShortcut>
                    <Icon {...item.rightIcon} />
                  </DropdownMenuShortcut>
                )}
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
