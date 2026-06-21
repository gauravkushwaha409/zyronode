import { type VariantProps } from 'class-variance-authority';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import type * as React from 'react';
declare const tooltipContentVariants: (props?: ({
    variant?: "default" | "light" | null | undefined;
    size?: "default" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom';
declare function TooltipProvider({ delayDuration, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>): import("react/jsx-runtime").JSX.Element;
declare function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>): import("react/jsx-runtime").JSX.Element;
declare function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>): import("react/jsx-runtime").JSX.Element;
type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content> & VariantProps<typeof tooltipContentVariants> & {
    showTipArrow?: boolean;
    placement?: TooltipPlacement;
    tooltipPrimaryText?: string | undefined;
    tooltipSecondaryText?: string | undefined;
};
declare function TooltipContent({ className, sideOffset, alignOffset, children, variant, size, showTipArrow, placement, side, align, tooltipSecondaryText, tooltipPrimaryText, ...props }: TooltipContentProps): import("react/jsx-runtime").JSX.Element;
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
export type { TooltipContentProps };
