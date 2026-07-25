import { cn } from '#lib/utils';
import type React from 'react';
import type {
  DropdownRadioItem,
  DropdownWrapperRadioApi,
} from '../../hooks/use-dropdown-wrapper-radio';
import { Icon } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '../shadcn/dropdown-menu';

export interface TriggerButtonRadioProps<T extends string>
  extends React.ComponentProps<'button'> {
  selectedItem: DropdownRadioItem<T> | undefined;
  isOpen: boolean;
}

interface DropdownWrapperRadioProps<T extends string> {
  dropdown: DropdownWrapperRadioApi<T>;
  TriggerButton: React.ComponentType<TriggerButtonRadioProps<T>>;
  dropdownMenuContentProps?: Pick<
    React.ComponentProps<typeof DropdownMenuContent>,
    'className'
  >;
}

export function DropdownWrapperRadio<T extends string>({
  dropdown,
  TriggerButton,
  dropdownMenuContentProps,
}: DropdownWrapperRadioProps<T>) {
  const { items, currentValue, selectedItem, onChange, open, setOpen } =
    dropdown;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="w-fit shrink-0" asChild>
        <TriggerButton selectedItem={selectedItem} isOpen={open} />
      </DropdownMenuTrigger>

      <DropdownMenuContent {...dropdownMenuContentProps}>
        <DropdownMenuRadioGroup
          value={currentValue as T}
          onValueChange={(value) => onChange(value as T)}
          className="p-1 rounded-[10px] space-y-0.5"
        >
          {items.map((item) => {
            const { className: leftClassName, name: leftName } =
              item?.leftIcon ?? {};
            const { className: rightClassName, name: rightName } =
              item?.rightIcon ?? {};

            return (
              <DropdownMenuRadioItem
                onClick={item.onClick}
                key={item.value}
                value={item.value}
              >
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-x-2.5">
                    {leftName && (
                      <DropdownMenuShortcut>
                        <Icon
                          name={leftName}
                          className={cn(
                            'group-data-[state=checked]/dropdown-menu-radio-item:text-gray-950',
                            leftClassName,
                          )}
                        />
                      </DropdownMenuShortcut>
                    )}
                    {item.label}
                  </div>

                  {rightName && (
                    <DropdownMenuShortcut>
                      <Icon
                        name={rightName}
                        className={cn(
                          'group-data-[state=checked]/dropdown-menu-radio-item:text-gray-950',
                          rightClassName,
                        )}
                      />
                    </DropdownMenuShortcut>
                  )}
                </div>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
