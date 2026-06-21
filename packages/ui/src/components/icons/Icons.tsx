import { cn } from '#lib/utils';
import { iconMap, type IconName } from '@package/icons';
import { memo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type TooltipContentProps,
} from '../shadcn';

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

export const Icon = memo(
  ({
    name,
    size,
    className,
    showTooltip,
    tooltipText,
    tooltipPlacement,
    tooltipVariant,
    tooltipSize,
    showTipArrow,
    tooltipClassName,
    tooltipPrimaryText,
    tooltipSecondaryText,
    sideoffset = 2,
    alignOffset = -10,
    ...props
  }: IconProps) => {
    const IconComponent = iconMap[name];

    const icon = (
      <IconComponent
        width={size ?? '1em'}
        height={size ?? '1em'}
        className={cn('shrink-0', className)}
        style={
          size ? { width: size, height: size, ...props.style } : props.style
        }
        {...props}
      />
    );

    if (
      !showTooltip ||
      (!tooltipText && !tooltipPrimaryText && !tooltipSecondaryText)
    ) {
      return icon;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <span className="relative inline-flex w-fit">
            <TooltipTrigger asChild>
              <span className="inline-flex w-fit">{icon}</span>
            </TooltipTrigger>
            <TooltipContent
              placement={tooltipPlacement ?? 'top'}
              variant={tooltipVariant}
              size={tooltipSize}
              showTipArrow={showTipArrow ?? true}
              className={tooltipClassName}
              sideOffset={sideoffset}
              alignOffset={alignOffset}
              tooltipPrimaryText={tooltipPrimaryText ?? undefined}
              tooltipSecondaryText={tooltipSecondaryText ?? undefined}
            >
              {tooltipText}
            </TooltipContent>
          </span>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
