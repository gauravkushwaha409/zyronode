import { Typography } from '@package/ui';

export function ConversationLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Typography.T6 className="text-gray-400" weight="medium">
        Loading messages...
      </Typography.T6>
    </div>
  );
}

export function ConversationError() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Typography.T6 className="text-gray-400" weight="medium">
        Error loading messages. Please try again later.
      </Typography.T6>
    </div>
  );
}
