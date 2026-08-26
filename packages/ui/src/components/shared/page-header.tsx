import { cn } from "../../lib/utils";
import type React from 'react';
import { Typography } from './typography';
interface SectionHeaderProps {
  title: string;
  description: string;
  titleClassName?: string;
  descriptionClassName?: string;
  className?: string;
  actions?: React.ReactNode;
}
export const PageHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  titleClassName,
  descriptionClassName,
  className,
  actions,
}) => {
  return (
    <section className={cn('flex justify-between', className)}>
      <div className="space-y-1">
        <Typography.H5 weight="semibold" className={cn('', titleClassName)}>
          {title}
        </Typography.H5>

        <Typography.T2
          weight="regular"
          className={cn('text-gray-500 w-125', descriptionClassName)}
        >
          {description}
        </Typography.T2>
      </div>
      {actions}
    </section>
  );
};
