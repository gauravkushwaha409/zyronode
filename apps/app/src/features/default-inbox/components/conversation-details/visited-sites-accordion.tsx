import { Typography } from '@package/ui';

export function VisitedSites() {
  return (
    <div className="border-b border-gray-100">
      <div className="px-3 py-2.5">
        <Typography.T5 className="text-gray-600" weight="medium">
          Visited Sites
        </Typography.T5>
      </div>
      <div className="pb-2 px-3">
        <Typography.T5 className="text-gray-400">No visited sites available</Typography.T5>
      </div>
    </div>
  );
}
