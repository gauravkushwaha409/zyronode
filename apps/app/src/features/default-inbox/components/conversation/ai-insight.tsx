import { Icon, Typography } from '@package/ui';

export function AIInsight() {
  return (
    <button type="button" className="flex items-center gap-x-1.5">
      <div>
        <Typography.Cap weight="regular" className="text-gray-400">
          AI Insight
        </Typography.Cap>
        <div className="flex items-center gap-x-1.5">
          <Icon size={12} name="dot" className="text-red-500" />
          <Typography.T5 weight="medium" className="text-gray-800">
            At Risk
          </Typography.T5>
        </div>
      </div>
      <Icon size={12} name="arrow-down" className="text-gray-400" />
    </button>
  );
}
