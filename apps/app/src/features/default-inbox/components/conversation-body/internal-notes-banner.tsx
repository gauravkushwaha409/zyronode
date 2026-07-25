import { Icon, Typography } from '@package/ui';

export function InternalNotesBanner() {
  return (
    <div className="px-4 py-2.5 flex items-center gap-x-2 rounded-[12px]">
      <Icon name="note" size={16} className="text-warning-600" />
      <Typography.T5 weight="medium" className="text-warning-600">
        Notes are visible only to your team and never shared with visitors.
      </Typography.T5>
    </div>
  );
}
