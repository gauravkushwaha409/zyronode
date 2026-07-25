import type React from 'react';
import { Input } from '../shadcn/input';

interface GlobalSearchProps extends React.ComponentPropsWithRef<typeof Input> {
  search: { value: string; onChange: (value: string) => void };
  placeholder?: string;
}

export function GlobalSearch({
  search,
  placeholder = 'Search...',
  ...rest
}: GlobalSearchProps) {
  const { className, ...restProps } = rest ?? {};
  return (
    <Input
      leftIcon="search"
      placeholder={placeholder}
      value={search.value}
      onChange={(e) => search.onChange(e.target.value)}
      className={`w-sm rounded-full ${className}`}
      {...restProps}
    />
  );
}
