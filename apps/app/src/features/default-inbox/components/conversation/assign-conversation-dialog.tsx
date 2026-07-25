import { Avatar, Icon } from '@package/ui';

export function AssignConversationDialog() {
  return (
    <button
      type="button"
      className="py-0.5 pl-0.5 pr-1 flex items-center gap-x-0.5 bg-gray-active-1 rounded-full"
    >
      <Avatar fallbackText="A" fallbackType="icon" size="md" />
      <Icon name="arrow-down" size={16} className="text-gray-500" />
    </button>
  );
}
