import type { IconName } from '@package/icons';
import { Avatar as AvatarPrimitive } from 'radix-ui';
import * as React from 'react';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'default' | 'lg' | 'xl' | '2xl';
type AvatarFallbackType = 'text' | 'icon';
interface AvatarGroupProps extends React.ComponentProps<'div'> {
    size?: AvatarSize;
    max?: number;
}
declare function AvatarGroup({ className, size, max, children, ...props }: AvatarGroupProps): import("react/jsx-runtime").JSX.Element;
declare function AvatarGroupCount({ className, children, ...props }: React.ComponentProps<'div'>): import("react/jsx-runtime").JSX.Element;
interface AvatarProps extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, 'children'> {
    size?: AvatarSize;
    image?: string | undefined;
    alt?: string;
    fallbackText?: string;
    fallbackType?: AvatarFallbackType;
    iconName?: IconName;
    isActive?: boolean;
    showAvatarBadge?: boolean;
    imageClassName?: string;
}
declare function Avatar({ size, image, alt, fallbackText, fallbackType, iconName, isActive, showAvatarBadge, imageClassName, className, ...props }: AvatarProps): import("react/jsx-runtime").JSX.Element;
export { Avatar, AvatarGroup, AvatarGroupCount };
