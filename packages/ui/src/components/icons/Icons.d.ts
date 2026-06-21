import { type IconName } from '@package/icons';
import { type TooltipContentProps } from '../shadcn';
export interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
    name: IconName;
    size?: number | string;
    showTooltip?: boolean;
    tooltipText?: React.ReactNode;
    tooltipPrimaryText?: string | undefined;
    tooltipSecondaryText?: string | undefined;
    tooltipPlacement?: TooltipContentProps['placement'];
    tooltipVariant?: TooltipContentProps['variant'];
    tooltipSize?: TooltipContentProps['size'];
    showTipArrow?: TooltipContentProps['showTipArrow'];
    tooltipClassName?: string;
    sideoffset?: number;
    alignOffset?: number;
}
export declare const Icon: import("react").MemoExoticComponent<({ name, size, className, showTooltip, tooltipText, tooltipPlacement, tooltipVariant, tooltipSize, showTipArrow, tooltipClassName, tooltipPrimaryText, tooltipSecondaryText, sideoffset, alignOffset, ...props }: IconProps) => import("react/jsx-runtime").JSX.Element>;
