import { type VariantProps } from 'class-variance-authority';
import type React from 'react';
declare const inputVariants: (props?: ({
    size?: "default" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'>, VariantProps<typeof inputVariants> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}
declare function Input({ className, type, size, leftIcon, rightIcon, ...props }: InputProps): import("react/jsx-runtime").JSX.Element;
export { Input };
