import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";
import { cn } from "#lib/utils";
import { Icon } from "../icons";
import type { IconName } from "@package/icons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
	type TooltipContentProps,
} from "../shadcn";

const buttonVariants = cva(
	"group/button aria-invalid:border-destructive aria-invalid:ring-destructive/20 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent bg-clip-padding text-base font-medium whitespace-nowrap transition-all outline-none select-none active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-invalid:ring-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 w-full",
	{
		variants: {
			variant: {
				default:
					"bg-primary-500 text-white-base hover:bg-primary-600 disabled:bg-primary-200",
				"primary-shade":
					"border-primary-100 bg-primary-50 text-primary-500 hover:border-primary-200 hover:bg-primary-100 disabled:border-primary-50 disabled:bg-primary-200 disabled:text-white-base",
				outline:
					"border-primary-500 text-primary-500 hover:border-primary-600 hover:text-primary-600 disabled:border-primary-200 disabled:text-primary-200",
				secondary:
					"border-gray-border-200 text-gray-800 hover:bg-gray-fill-50 focus:border-gray-border-300 disabled:border-gray-border-100 disabled:text-gray-400",
				gray: "bg-gray-700 text-white-base hover:bg-gray-800 disabled:border-gray-300 disabled:bg-gray-300",
				success:
					"border-success-500 bg-success-500 text-white-base hover:border-success-600 hover:bg-success-600 disabled:border-success-200 disabled:bg-success-200",
				ghost:
					"text-gray-400 hover:text-gray-800 disabled:text-gray-300",
				alert:
					"border-alert-500 bg-alert-500 text-white-base hover:border-alert-600 hover:bg-alert-600 disabled:border-alert-100 disabled:bg-alert-100",
				"alert-shade":
					"border-alert-25 bg-alert-25 text-alert-500 hover:bg-alert-50 disabled:border-alert-100 disabled:bg-alert-100 disabled:text-white-base",
				link: "text-primary-500 underline-offset-4 hover:underline",
			},
			size: {
				default:
					"typo-t1 h-10 gap-2.5 px-5",
				xs: "typo-t5 h-[34px] gap-2 px-[14px]",
				sm: "typo-t3 h-[36px] gap-2.5 px-4",
				lg: "typo-t1 h-11 gap-2.5 px-6",
				xl: "typo-t1 h-12 gap-2.5 px-6",
				icon: "h-10 w-10",
				"icon-xs": "h-[34px] w-[34px]",
				"icon-sm": "h-[36px] w-[36px]",
				"icon-lg": "h-11 w-11",
				"icon-xl": "h-12 w-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const getIconSize = (size: VariantProps<typeof buttonVariants>["size"]) => {
	const iconSizeMap: Record<string, number> = {
		default: 20,
		xs: 16,
		sm: 18,
		lg: 20,
		xl: 20,
		icon: 20,
		"icon-xs": 16,
		"icon-sm": 18,
		"icon-lg": 20,
	};
	return iconSizeMap[size ?? "default"] ?? 20;
};

const Button = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<"button"> &
		VariantProps<typeof buttonVariants> & {
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
>(
	(
		{
			className,
			variant = "default",
			size = "default",
			asChild = false,
			icon,
			leftIcon,
			isPending,
			pendingText,
			rightIcon,
			showTooltip,
			tooltipText,
			tooltipPrimaryText,
			tooltipSecondaryText,
			tooltipPlacement,
			showTipArrow,
			showLoading = true,
			children,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot.Root : "button";

		const isIconOnly = !children && (!!icon || !!leftIcon || !!rightIcon);
		const activeIcon = icon || leftIcon || rightIcon;
		const iconSize = getIconSize(size);

		const content = isIconOnly ? (
			<Icon name={activeIcon as IconName} size={iconSize} />
		) : (
			<>
				{leftIcon && !isPending && (
					<Icon
						name={leftIcon}
						size={iconSize}
						data-icon="inline-start"
					/>
				)}
				{isPending && showLoading && (
					<Icon
						name="load"
						className="animate-spin"
						size={iconSize}
						data-icon="inline-start"
					/>
				)}
				{isPending && pendingText ? pendingText : children}
				{rightIcon && !isPending && (
					<Icon
						name={rightIcon as IconName}
						size={iconSize}
						data-icon="inline-end"
					/>
				)}
			</>
		);

		const button = (
			<Comp
				type="button"
				data-slot="button"
				data-variant={variant}
				data-size={size}
				disabled={isPending}
				data-icon-only={isIconOnly || undefined}
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			>
				{content}
			</Comp>
		);

		if (
			!showTooltip ||
			(!tooltipText && !tooltipPrimaryText && !tooltipSecondaryText)
		) {
			return button;
		}

		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>{button}</TooltipTrigger>
					<TooltipContent
						placement={tooltipPlacement ?? "top"}
						showTipArrow={showTipArrow ?? true}
						tooltipPrimaryText={tooltipPrimaryText}
						tooltipSecondaryText={tooltipSecondaryText}
					>
						{tooltipText}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
