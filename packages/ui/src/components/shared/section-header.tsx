import { cn } from "../../lib/utils";
import type React from "react";
import { Icon } from "../icons";
import { Typography } from "./typography";

interface SectionHeaderWithIconProps {
  heading: string;
  description: string;
  showIcon?: boolean;
  tooltipPrimaryText?: string;
  tooltipSecondaryText?: string;
  tooltipPlacement?: string;
  className?: string;
  actions?: React.ReactNode;
}
export const SectionHeader: React.FC<SectionHeaderWithIconProps> = ({
  heading,
  description,
  tooltipPrimaryText,
  tooltipSecondaryText,
  showIcon = false,
  tooltipPlacement = "top-left",
  className,
  actions,
}) => {
  return (
    <section className={cn("flex justify-between", className)}>
      <section>
        <div className="flex items-center gap-2.5 mb-1">
          <Typography.T2 className="text-gray-950" weight="semibold">
            {heading}
          </Typography.T2>
          {showIcon && (
            <Icon
              name="alert"
              className="text-gray-500"
              showTooltip
              tooltipPrimaryText={tooltipPrimaryText}
              tooltipSecondaryText={tooltipSecondaryText}
              tooltipSize={"lg"}
              tooltipPlacement={tooltipPlacement as never}
            />
          )}
        </div>
        <Typography.T4 className="text-gray-500">{description}</Typography.T4>
      </section>
      {actions}
    </section>
  );
};
