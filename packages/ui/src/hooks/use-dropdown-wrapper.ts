import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import type { DropdownMenuItem, Icon } from '../components';

type IconProp = Pick<
  React.ComponentProps<typeof Icon>,
  'name' | 'size' | 'className'
>;
interface IconProps extends IconProp {}

type DropdownMenuItemProps = Pick<
  React.ComponentProps<typeof DropdownMenuItem>,
  'onClick' | 'className' | 'variant'
>;

export interface DropdownItem<T extends string = string>
  extends DropdownMenuItemProps {
  value: T;
  label: string;
  leftIcon?: IconProps;
  rightIcon?: IconProps;
  shortcut?: string;
  disabled?: boolean;
}

export interface DropdownSubItem<T extends string = string>
  extends DropdownMenuItemProps {
  label: string;
  leftIcon?: IconProps;
  items: DropdownSingleItem<T>[];
}

export type DropdownSingleItem<T extends string = string> =
  | DropdownItem<T>
  | DropdownSubItem<T>;

export type DropdownGroup<T extends string = string> = DropdownSingleItem<T>[];

export type DropdownItems<T extends string = string> =
  | readonly DropdownItem<T>[]
  | readonly DropdownGroup<T>[];

function isGroupedItems<T extends string>(
  items: DropdownItems<T>,
): items is readonly DropdownGroup<T>[] {
  return Array.isArray(items[0]);
}

function flattenGroup<T extends string>(
  items: readonly DropdownSingleItem<T>[],
): DropdownItem<T>[] {
  return items.flatMap((item) =>
    'items' in item ? flattenGroup(item.items) : [item],
  );
}

function flattenItems<T extends string>(
  items: DropdownItems<T>,
): DropdownItem<T>[] {
  if (isGroupedItems(items)) {
    return items.flatMap((group) => flattenGroup(group));
  }
  return [...items];
}

export interface DropdownWrapperApi<T extends string> {
  items: DropdownItems<T>;
  flatItems: DropdownItem<T>[];
  currentValue: T | undefined;
  selectedItem: DropdownItem<T> | undefined;
  onChange: (value: T) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface UseDropdownWrapperOptions<T extends string> {
  items: DropdownItems<T>;
  defaultValue?: T;
  paramKey?: string;
}

export function useDropdownWrapper<T extends string>({
  items,
  defaultValue,
  paramKey = 'dropdown',
}: UseDropdownWrapperOptions<T>): DropdownWrapperApi<T> {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const [open, setOpen] = useState(false);

  const flatItems = useMemo(() => flattenItems(items), [items]);

  const rawValue = search[paramKey] as T | undefined;
  const validValues = new Set(flatItems.map((i) => i.value));
  const currentValue = (
    rawValue !== undefined && validValues.has(rawValue)
      ? rawValue
      : defaultValue
  ) as T | undefined;

  const selectedItem = currentValue
    ? flatItems.find((i) => i.value === currentValue)
    : undefined;

  const onChange = useCallback(
    (value: T) => {
      navigate({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          [paramKey]: value,
        }),
        replace: true,
      } as never);
      setOpen(false);
    },
    [navigate, paramKey],
  );

  return {
    items,
    flatItems,
    currentValue,
    selectedItem,
    onChange,
    open,
    setOpen,
  };
}
