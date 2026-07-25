import { cn } from '#lib/utils';
import type React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../shadcn/accordion';

type AccordionType = 'single' | 'multiple';

interface AccordionItemData {
  value: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface AccordionWrapperProps {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  disabled?: boolean;
  items: AccordionItemData[];
  className?: string;
  showIcon?: boolean;

  accordionProps?: Omit<
    React.ComponentProps<typeof Accordion>,
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'collapsible'
    | 'disabled'
    | 'children'
  >;
  accordionItemProps?: Pick<
    React.ComponentProps<typeof AccordionItem>,
    'className'
  >;
  accordionTriggerProps?: Pick<
    React.ComponentProps<typeof AccordionTrigger>,
    'className' | 'showIcon' | 'asChild'
  >;
  accordionContentProps?: Pick<
    React.ComponentProps<typeof AccordionContent>,
    'className'
  >;
}

export const AccordionWrapper = ({
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  disabled = false,
  items,
  className,
  showIcon = true,
  accordionProps,
  accordionItemProps,
  accordionTriggerProps,
  accordionContentProps,
}: AccordionWrapperProps) => {
  const { className: accordionClassNameProp, ...restAccordionProps } =
    accordionProps || {};
  const { className: itemClassNameProp, ...restItemProps } =
    accordionItemProps || {};
  const {
    className: triggerClassNameProp,
    showIcon: triggerShowIcon,
    ...restTriggerProps
  } = accordionTriggerProps || {};
  const { className: contentClassNameProp, ...restContentProps } =
    accordionContentProps || {};

  const accordionPropsFinal = {
    type,
    value,
    defaultValue,
    onValueChange,
    collapsible,
    disabled,
    className: cn('w-full', accordionClassNameProp, className),
    ...restAccordionProps,
  } as React.ComponentProps<typeof Accordion>;

  return (
    <Accordion {...accordionPropsFinal}>
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          {...(item.disabled !== undefined && { disabled: item.disabled })}
          className={cn('border-b', itemClassNameProp, item.className)}
          {...restItemProps}
        >
          <AccordionTrigger
            className={cn(
              'py-2 px-3.5 typo-t5 font-medium [&[data-state=open]>svg]:rotate-180',
              triggerClassNameProp,
            )}
            showIcon={triggerShowIcon ?? showIcon}
            {...restTriggerProps}
          >
            {item.title}
          </AccordionTrigger>
          <AccordionContent
            className={cn('pb-4 pt-0 text-sm', contentClassNameProp)}
            {...restContentProps}
          >
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export type { AccordionItemData, AccordionType, AccordionWrapperProps };
