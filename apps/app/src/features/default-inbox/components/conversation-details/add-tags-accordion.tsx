import { Typography } from '@package/ui';

export function AddTags() {
  return (
    <div className="border-b border-gray-100">
      <div className="px-3 py-2.5">
        <Typography.T5 className="text-gray-600" weight="medium">
          Add Tags
        </Typography.T5>
      </div>
      <div className="pb-2 px-3">
        <Typography.T5 className="text-gray-400">No tags added</Typography.T5>
      </div>
    </div>
  );
}
