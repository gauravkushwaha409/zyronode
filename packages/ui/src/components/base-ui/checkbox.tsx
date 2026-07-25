import { cn } from '#lib/utils';
import type * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { Icon } from '../icons';

function Checkbox({
  className,
  asChild,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer relative flex size-6 shrink-0 items-center justify-center rounded-[6px] border border-gray-300 shadow-xs transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 data-checked:border-primary data-checked:bg-primary data-checked:text-white-base',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid size-full place-content-center text-current transition-none [&>svg]:size-5"
      >
        <Icon name="tick" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
