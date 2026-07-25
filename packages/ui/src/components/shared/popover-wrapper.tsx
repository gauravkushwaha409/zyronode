import type React from 'react';
import { cn } from '#lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger as ShadcnPopoverTrigger,
} from '../shadcn/popover';

interface PopoverTriggerProps
  extends React.ComponentProps<typeof ShadcnPopoverTrigger> {}

interface PopoverWrapperProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  Trigger?: React.ComponentType<PopoverTriggerProps>;

  align?: 'center' | 'start' | 'end';
  sideOffset?: number;
  className?: string;

  popoverProps?: Omit<
    React.ComponentProps<typeof Popover>,
    'open' | 'onOpenChange'
  >;
  popoverTriggerProps?: React.ComponentProps<typeof ShadcnPopoverTrigger>;
  popoverContentProps?: Pick<
    React.ComponentProps<typeof PopoverContent>,
    'className' | 'align' | 'sideOffset' | 'alignOffset' | 'side'
  >;
  popoverHeaderProps?: React.ComponentProps<'div'>;
  popoverTitleProps?: React.ComponentProps<'h2'>;
  popoverDescriptionProps?: React.ComponentProps<'p'>;
}

export const PopoverWrapper = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  Trigger,
  align = 'center',
  sideOffset = 4,
  className,

  popoverProps,
  popoverTriggerProps,
  popoverContentProps,
  popoverHeaderProps,
  popoverTitleProps,
  popoverDescriptionProps,
}: PopoverWrapperProps) => {
  const { ...restPopoverProps } = popoverProps || {};
  const { className: contentClassNameProp, ...restPopoverContentProps } =
    popoverContentProps || {};
  const { className: headerClassNameProp, ...restPopoverHeaderProps } =
    popoverHeaderProps || {};
  const { className: titleClassNameProp, ...restPopoverTitleProps } =
    popoverTitleProps || {};
  const {
    className: descriptionClassNameProp,
    ...restPopoverDescriptionProps
  } = popoverDescriptionProps || {};

  return (
    <Popover
      {...(open !== undefined ? { open, onOpenChange } : {})}
      {...restPopoverProps}
    >
      {Trigger && (
        <ShadcnPopoverTrigger asChild {...popoverTriggerProps}>
          <Trigger />
        </ShadcnPopoverTrigger>
      )}

      <PopoverContent
        align={align}
        sideOffset={sideOffset}
        className={cn(className, contentClassNameProp)}
        {...restPopoverContentProps}
      >
        {(title || description) && (
          <PopoverHeader
            className={cn('px-1', headerClassNameProp)}
            {...restPopoverHeaderProps}
          >
            {title && (
              <PopoverTitle
                className={cn('text-sm font-medium', titleClassNameProp)}
                {...restPopoverTitleProps}
              >
                {title}
              </PopoverTitle>
            )}

            {description && (
              <PopoverDescription
                className={cn(
                  'text-xs text-muted-foreground',
                  descriptionClassNameProp,
                )}
                {...restPopoverDescriptionProps}
              >
                {description}
              </PopoverDescription>
            )}
          </PopoverHeader>
        )}
        {children}
      </PopoverContent>
    </Popover>
  );
};
