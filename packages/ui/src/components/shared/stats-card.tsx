import type { IconName } from '@package/icons';
import { Icon } from '../icons';
import Typography from './typography';

export interface StatsCardProps {
  icon: IconName;
  title: string;
  statNum: number;
}
export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  title,
  statNum,
}) => {
  return (
    <section className="rounded-[12px] border bg-gray-50 border-gray-300">
      <div className="flex px-3 py-2.25 gap-2 ">
        <Icon name={icon} size={16} className="text-gray-500" />
        <Typography.T5 weight="regular" className="text-gray-700">
          {title}
        </Typography.T5>
      </div>
      <div className="bg-white-base rounded-[12px] border-t px-5 py-4">
        <Typography.H5 weight="semibold" className="text-gray-950">
          {statNum}
        </Typography.H5>
      </div>
    </section>
  );
};
