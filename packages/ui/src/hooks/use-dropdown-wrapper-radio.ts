import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import type { DropdownMenuItem, Icon } from '../components';

interface IconProps
  extends Pick<
    React.ComponentProps<typeof Icon>,
    'className' | 'name' | 'size'
  > {}

type DropdownMenuItemProps = Pick<
  React.ComponentProps<typeof DropdownMenuItem>,
  'onClick'
>;
export interface DropdownRadioItem<T extends string = string>
  extends DropdownMenuItemProps {
  value: T;
  label: string;
  leftIcon?: IconProps;
  rightIcon?: IconProps;
}

export interface DropdownWrapperRadioApi<T extends string> {
  items: readonly DropdownRadioItem<T>[];
  currentValue: T;
  selectedItem: DropdownRadioItem<T> | undefined;
  onChange: (value: T) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface UseDropdownWrapperRadioOptions<T extends string> {
  items: readonly DropdownRadioItem<T>[];
  defaultValue?: T;
  paramKey?: string;
  value?: T;
  onValueChange?: (value: T) => void;
}

export function useDropdownWrapperRadio<T extends string>({
  items,
  defaultValue,
  paramKey = 'dropdown',
  value: controlledValue,
  onValueChange,
}: UseDropdownWrapperRadioOptions<T>): DropdownWrapperRadioApi<T> {
  const navigate = useNavigate();
  const searchData = useSearch({ strict: false }) as Record<string, unknown>;
  const search = controlledValue !== undefined ? {} : searchData;
  const [open, setOpen] = useState(false);

  const validValues = new Set(items.map((i) => i.value));
  const rawValue = search[paramKey] as T | undefined;
  const resolved = (
    controlledValue !== undefined
      ? controlledValue
      : rawValue !== undefined && validValues.has(rawValue)
        ? rawValue
        : defaultValue
  ) as T;

  const currentValue = resolved;
  const selectedItem = currentValue
    ? items.find((i) => i.value === currentValue)
    : undefined;

  const onChange = useCallback(
    (value: T) => {
      if (onValueChange) {
        onValueChange(value);
      } else {
        navigate({
          search: (prev: Record<string, unknown>) => ({
            ...prev,
            [paramKey]: value,
          }),
          replace: true,
        } as never);
      }
      setOpen(false);
    },
    [navigate, paramKey, onValueChange],
  );

  return { items, currentValue, selectedItem, onChange, open, setOpen };
}
