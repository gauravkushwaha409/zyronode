import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';

import { cn } from '#lib/utils';
import { Icon } from '../icons';
import type { IconName } from '@package/icons';

const inputVariants = cva(
  [
    'flex w-full min-w-0 items-center justify-between gap-2 rounded-[6px] border border-gray-200 bg-transparent text-gray-500',
    'transition-[color,box-shadow]',
    'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 ',
  ],
  {
    variants: {
      size: {
        default: 'h-10 px-3',
        lg: 'h-11 px-[14px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const inputElementVariants = cva(
  [
    'flex-1 border-0 bg-transparent font-medium shadow-none outline-none',
    'text-gray-950 placeholder:font-normal placeholder:text-gray-500',
    'disabled:pointer-events-none disabled:placeholder:text-gray-400',
    'file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium data-[disabled=true]:text-gray-400',
    'group-data-[disabled=true]:text-gray-400 group-data-[disabled=true]:placeholder:text-gray-400',
  ],
  {
    variants: {
      size: {
        default: 'typo-t3',
        lg: 'typo-t1',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const getIconSize = (size: VariantProps<typeof inputVariants>['size']) => {
  const iconSizeMap: Record<string, number> = {
    default: 16,
    lg: 20,
  };
  return iconSizeMap[size ?? 'default'] ?? 16;
};

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode | IconName;
  rightIcon?: React.ReactNode | IconName;
}

function Input({
  className,
  type,
  size,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) {
  const iconSize = getIconSize(size);
  const isDisabled = props.disabled;
  const isInvalid =
    props['aria-invalid'] === true || props['aria-invalid'] === 'true';

  return (
    <div
      data-disabled={isDisabled ? 'true' : undefined}
      data-invalid={isInvalid ? 'true' : undefined}
      className={cn(
        'group',
        inputVariants({ size }),
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:border-gray-border-200 data-[disabled=true]:bg-gray-50 data-[disabled=true]:text-gray-400',
        'data-[invalid=true]:border-alert-500 focus-within:data-[invalid=true]:ring-2 data-[invalid=true]:focus-within:ring-alert-100',
        className,
      )}
    >
      {leftIcon &&
        (typeof leftIcon === 'string' ? (
          <Icon name={leftIcon as IconName} size={iconSize} />
        ) : (
          leftIcon
        ))}

      <input
        type={type}
        data-slot="input"
        className={cn(inputElementVariants({ size }))}
        {...props}
      />

      {rightIcon &&
        (typeof rightIcon === 'string' ? (
          <Icon name={rightIcon as IconName} size={iconSize} />
        ) : (
          rightIcon
        ))}
    </div>
  );
}

export { Input };
