import { Avatar, Typography } from '@package/ui';

export function EscalateToTeamLeadPopover() {
  return (
    <button
      type="button"
      className="w-full px-3 py-2.5 flex items-center justify-between rounded-bl-[10px] border-t border-t-gray-100"
    >
      <Typography.T5 weight="medium" className="text-gray-500">
        Select to escalate
      </Typography.T5>
      <div className="max-w-max flex -space-x-1">
        <Avatar size="sm" fallbackType="text" fallbackText="A" />
        <Avatar size="sm" fallbackType="text" fallbackText="B" />
      </div>
    </button>
  );
}
