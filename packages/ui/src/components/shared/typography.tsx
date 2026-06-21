import type React from 'react';
import type { ElementType, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

const tokens = {
  d1: {
    tag: 'h1',
    classes: 'text-[36px] font-bold leading-[1.25] tracking-[-0.01em]',
  },
  d2: {
    tag: 'h1',
    classes: 'text-[30px] font-bold leading-[1.30] tracking-[-0.01em]',
  },
  h1: {
    tag: 'h1',
    classes: 'text-[28px] font-bold leading-[1.4] tracking-[-0.01em]',
  },
  h2: {
    tag: 'h2',
    classes: 'text-[26px] font-bold leading-[1.5]  tracking-[-0.01em]',
  },
  h3: {
    tag: 'h3',
    classes: 'text-[24px] font-bold leading-[1.5] tracking-[-0.01em]',
  },
  h4: {
    tag: 'h4',
    classes: 'text-[22px] font-bold leading-[1.5]  tracking-[-0.01em]',
  },
  h5: {
    tag: 'h5',
    classes: 'text-[20px] font-medium leading-[1.5] tracking-[-0.01em]',
  },
  h6: {
    tag: 'h6',
    classes: 'text-[18px] font-medium leading-[1.5]  tracking-[-0.01em]',
  },
  t1: {
    tag: 'p',
    classes: 'text-[16px] font-normal leading-[1.5] ',
  },
  t2: {
    tag: 'p',
    classes: 'text-[15px] font-normal leading-[1.45]',
  },
  t3: {
    tag: 'p',
    classes: 'text-[14px] font-normal leading-[1.45]',
  },
  t4: {
    tag: 'p',
    classes: 'text-[13px] font-normal leading-[1.4]',
  },
  t5: {
    tag: 'span',
    classes: 'text-[12px] font-normal leading-[1.5] tracking-[0.01em]',
  },
  t6: {
    tag: 'span',
    classes: 'text-[11px] font-normal leading-[1.45]  tracking-[0.01em]',
  },
  cap: {
    tag: 'span',
    classes: 'text-[10px] font-normal leading-[1.45]',
  },
} as const;

type VariantKey = keyof typeof tokens;

const weightMap = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

export type FontWeight = keyof typeof weightMap;

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(inputs.filter(Boolean).join(' '));
}

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  weight?: FontWeight;
  children?: React.ReactNode;
}

function createVariant(variant: VariantKey) {
  const { tag, classes } = tokens[variant];

  const Component = ({
    as,
    weight,
    className,
    children,
    ...rest
  }: TypographyProps) => {
    const Tag = (as ?? tag) as ElementType;
    const composedClass = cn(classes, weight && weightMap[weight], className);
    return (
      <Tag className={composedClass} {...rest}>
        {children}
      </Tag>
    );
  };

  Component.displayName = `Typography.${variant.toUpperCase()}`;
  return Component;
}

export const Typography = {
  D1: createVariant('d1'),
  D2: createVariant('d2'),
  H1: createVariant('h1'),
  H2: createVariant('h2'),
  H3: createVariant('h3'),
  H4: createVariant('h4'),
  H5: createVariant('h5'),
  H6: createVariant('h6'),
  T1: createVariant('t1'),
  T2: createVariant('t2'),
  T3: createVariant('t3'),
  T4: createVariant('t4'),
  T5: createVariant('t5'),
  T6: createVariant('t6'),
  Cap: createVariant('cap'),
};

export default Typography;
