import React from 'react';
import type {
  DropdownGroup,
  DropdownItem,
  DropdownItems,
  DropdownSingleItem,
  DropdownSubItem,
  DropdownWrapperApi,
} from '../../hooks/use-dropdown-wrapper';
import { Icon } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../shadcn/dropdown-menu';

export interface TriggerButtonProps<T extends string>
  extends React.ComponentProps<'button'> {
  selectedItem: DropdownItem<T> | undefined;
  isOpen: boolean;
}

interface DropdownWrapperProps<T extends string> {
  dropdown: DropdownWrapperApi<T>;
  TriggerButton: React.ComponentType<TriggerButtonProps<T>>;
  dropdownMenuContentProps?: Pick<
    React.ComponentProps<typeof DropdownMenuContent>,
    'className'
  >;
}

function isSubItem<T extends string>(
  item: DropdownSingleItem<T>,
): item is DropdownSubItem<T> {
  return 'items' in item && Array.isArray(item.items);
}

function isGroupedItems<T extends string>(
  items: DropdownItems<T>,
): items is DropdownGroup<T>[] {
  return Array.isArray(items[0]);
}

function renderDropdownItem<T extends string>(
  item: DropdownItem<T>,
  currentValue: T | undefined,
  onChange: (value: T) => void,
) {
  return (
    <DropdownMenuItem
      key={item.value}
      onClick={(event) => {
        item.onClick?.(event);
        onChange(item.value);
      }}
      data-selected={item.value === currentValue}
      {...(item.variant && { variant: item.variant })}
      className={item.className}
      {...(item.disabled && { disabled: item.disabled })}
    >
      {item.leftIcon && (
        <DropdownMenuShortcut>
          <Icon {...item.leftIcon} />
        </DropdownMenuShortcut>
      )}
      {item.label}
      {item.shortcut && (
        <DropdownMenuShortcut className="ml-auto">
          {item.shortcut}
        </DropdownMenuShortcut>
      )}
      {item.rightIcon && (
        <DropdownMenuShortcut className="ml-auto">
          <Icon {...item.rightIcon} />
        </DropdownMenuShortcut>
      )}
    </DropdownMenuItem>
  );
}

function renderItem<T extends string>(
  item: DropdownSingleItem<T>,
  currentValue: T | undefined,
  onChange: (value: T) => void,
) {
  if (isSubItem(item)) {
    return renderSubItem(item, currentValue, onChange);
  }
  return renderDropdownItem(item, currentValue, onChange);
}

function renderSubItem<T extends string>(
  item: DropdownSubItem<T>,
  currentValue: T | undefined,
  onChange: (value: T) => void,
) {
  return (
    <DropdownMenuSub key={item.label}>
      <DropdownMenuSubTrigger>
        {item.leftIcon && (
          <DropdownMenuShortcut>
            <Icon {...item.leftIcon} />
          </DropdownMenuShortcut>
        )}
        {item.label}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {item.items.map((subItem) =>
            renderItem(subItem, currentValue, onChange),
          )}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

/**
 * ============================================
 *              Dropdown Wrapper
 * ============================================
 */
export function DropdownWrapper<T extends string>({
  dropdown,
  TriggerButton,
  dropdownMenuContentProps,
}: DropdownWrapperProps<T>) {
  const { items, currentValue, selectedItem, onChange, open, setOpen } =
    dropdown;

  const groups: DropdownGroup<T>[] = isGroupedItems(items)
    ? items
    : [items as DropdownGroup<T>];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="w-fit shrink-0" asChild>
        <TriggerButton selectedItem={selectedItem} isOpen={open} />
      </DropdownMenuTrigger>

      <DropdownMenuContent {...dropdownMenuContentProps}>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup className="p-1 rounded-[10px]">
              {group.map((item) => renderItem(item, currentValue, onChange))}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
