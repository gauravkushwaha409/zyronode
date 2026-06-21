import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '#components/base-ui/dialog';
import type React from 'react';
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
interface DialogWrapperProps extends Pick<React.ComponentProps<typeof Dialog>, 'open' | 'onOpenChange'> {
    title?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    trigger?: React.ReactNode;
    contentClassName?: string;
    bodyClassName?: string;
    size?: DialogSize;
    isLoading?: boolean;
    showCloseButton?: boolean;
    applyContentClassNameToBody?: boolean;
    dialogProps?: Omit<React.ComponentProps<typeof Dialog>, 'open' | 'onOpenChange'>;
    dialogTriggerProps?: React.ComponentProps<typeof DialogTrigger>;
    dialogContentProps?: React.ComponentProps<typeof DialogContent>;
    dialogHeaderProps?: React.ComponentProps<typeof DialogHeader>;
    dialogTitleProps?: React.ComponentProps<typeof DialogTitle>;
    dialogDescriptionProps?: React.ComponentProps<typeof DialogDescription>;
    dialogFooterProps?: React.ComponentProps<typeof DialogFooter>;
}
export declare const DialogWrapper: ({ open, onOpenChange, title, description, isLoading, contentClassName, bodyClassName, size, showCloseButton, applyContentClassNameToBody, children, footer, trigger, dialogProps, dialogTriggerProps, dialogContentProps, dialogHeaderProps, dialogTitleProps, dialogDescriptionProps, dialogFooterProps, }: DialogWrapperProps) => import("react/jsx-runtime").JSX.Element;
export {};
