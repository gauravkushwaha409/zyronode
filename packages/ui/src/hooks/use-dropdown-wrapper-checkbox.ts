import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import type { Icon } from '../components';

interface IconProps extends React.ComponentProps<typeof Icon> {}

export interface DropdownCheckboxItem<T extends string = string> {
  value: T;
  label: string;
  leftIcon?: IconProps;
  rightIcon?: IconProps;
}

export interface DropdownWrapperCheckboxApi<T extends string> {
  items: readonly DropdownCheckboxItem<T>[];
  currentValues: T[];
  selectedItems: DropdownCheckboxItem<T>[];
  onChange: (value: T) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface UseDropdownWrapperCheckboxOptions<T extends string> {
  items: readonly DropdownCheckboxItem<T>[];
  defaultValues?: T[];
  paramKey?: string;
}

export function useDropdownWrapperCheckbox<T extends string>({
  items,
  defaultValues = [],
  paramKey = 'dropdown',
}: UseDropdownWrapperCheckboxOptions<T>): DropdownWrapperCheckboxApi<T> {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const [open, setOpen] = useState(false);

  const rawValue = search[paramKey] as string | undefined;
  const parsedValues = rawValue
    ? (rawValue.split(',').filter(Boolean) as T[])
    : [];
  const validValues = new Set(items.map((i) => i.value));
  const currentValues = parsedValues.every((v) => validValues.has(v))
    ? parsedValues
    : defaultValues;

  const selectedItems = currentValues
    .map((v) => items.find((i) => i.value === v))
    .filter((i): i is DropdownCheckboxItem<T> => i !== undefined);

  const onChange = useCallback(
    (value: T) => {
      navigate({
        search: (prev: Record<string, unknown>) => {
          const raw = (prev[paramKey] as string | undefined) ?? '';
          const current = raw ? (raw.split(',').filter(Boolean) as T[]) : [];
          const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
          return {
            ...prev,
            [paramKey]: next.length > 0 ? next.join(',') : undefined,
          };
        },
        replace: true,
      } as never);
    },
    [navigate, paramKey],
  );

  return {
    items,
    currentValues,
    selectedItems,
    onChange,
    open,
    setOpen,
  };
}
