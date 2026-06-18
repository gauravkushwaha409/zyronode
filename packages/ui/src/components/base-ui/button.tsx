import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";
import { cn } from "#lib/utils";

const buttonVariants = cva(
	"group/button aria-invalid:border-destructive aria-invalid:ring-destructive/20 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent bg-clip-padding text-base font-medium whitespace-nowrap transition-all outline-none select-none active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-invalid:ring-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-primary-500 text-white-base hover:bg-primary-600 disabled:bg-primary-200",
				outline:
					"border-primary-500 text-primary-500 hover:border-primary-600 hover:text-primary-600 disabled:border-primary-200 disabled:text-primary-200",
				secondary:
					"border-gray-border-200 text-gray-800 hover:bg-gray-fill-50 disabled:border-gray-border-100 disabled:text-gray-400",
				ghost:
					"text-gray-400 hover:text-gray-800 disabled:text-gray-300",
				destructive:
					"border-alert-500 bg-alert-500 text-white-base hover:border-alert-600 hover:bg-alert-600 disabled:border-alert-100 disabled:bg-alert-100",
				link: "text-primary-500 underline-offset-4 hover:underline",
			},
			size: {
				default:
					"typo-t1 h-10 gap-2.5 px-5",
				xs: "typo-t5 h-[34px] gap-2 px-[14px]",
				sm: "typo-t3 h-[36px] gap-2.5 px-4",
				lg: "typo-t1 h-11 gap-2.5 px-6",
				xl: "typo-t1 h-12 gap-2.5 px-6",
				icon: "size-10",
				"icon-xs": "size-[34px]",
				"icon-sm": "size-[36px]",
				"icon-lg": "size-11",
				"icon-xl": "size-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
