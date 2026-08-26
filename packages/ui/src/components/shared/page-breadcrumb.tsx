import { Icon, Typography } from '@package/ui';
import type { IconName } from '@package/icons';
import { cn } from "../../lib/utils";

type PageBreadcrumbProps = {
  pathSegments: string[];
  icon: IconName;
};

export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  pathSegments,
  icon,
}) => {
  return (
    <div className="h-14 border-b border-gray-200 flex items-center px-11 gap-4">
      <Icon name={icon} size={20} className="text-gray-500 " />
      <Icon name="arrow-right" size={16} className="text-gray-500 " />

      <div className="flex items-center gap-4">
        {pathSegments.map((path, index) => {
          const isLast = index === pathSegments.length - 1;

          return (
            <div key={path} className="flex items-center gap-4">
              <Typography.T4
                weight="medium"
                className={cn(
                  'text-gray-500 leading-0',
                  isLast && 'text-gray-800',
                )}
              >
                {path
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </Typography.T4>

              {!isLast && (
                <Icon name="arrow-right" size={16} className="text-gray-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
