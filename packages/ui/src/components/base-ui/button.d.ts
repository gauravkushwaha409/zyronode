import { type VariantProps } from "class-variance-authority";
import * as React from "react";
import type { IconName } from "@package/icons";
import type { TooltipContentProps } from "../shadcn";

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "primary-shade" | "outline" | "secondary" | "gray" | "success" | "ghost" | "alert" | "alert-shade" | null | undefined;
    size?: "default" | "lg" | "xs" | "sm" | "xl" | "icon" | "icon-xs" | "icon-sm" | "icon-lg" | "icon-xl" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;

declare interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    icon?: IconName;
    leftIcon?: IconName;
    rightIcon?: IconName;
    isPending?: boolean;
    pendingText?: string;
    showTooltip?: boolean;
    tooltipText?: string;
    tooltipPrimaryText?: string;
    tooltipSecondaryText?: string;
    tooltipPlacement?: TooltipContentProps["placement"];
    showTipArrow?: TooltipContentProps["showTipArrow"];
    showLoading?: boolean;
}

declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

export { Button, buttonVariants };
