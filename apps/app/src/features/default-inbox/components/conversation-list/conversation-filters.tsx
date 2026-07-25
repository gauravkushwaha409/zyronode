import { Icon } from '@package/ui';
import { cn } from '@package/ui';
import { useConversationActiveStatusFilter, useConversationStatusFilter, useCoversationChannelFilter } from '../../hooks';

export function FilterByActiveStateStatusAndChannel() {
  const activeStatusDropdown = useConversationActiveStatusFilter();
  const statusDropdown = useConversationStatusFilter();
  const channelDropdown = useCoversationChannelFilter();

  return (
    <div className="px-4 py-3 flex items-center gap-2.5 overflow-x-auto scrollbar-none">
      <button
        className={cn(
          'shrink-0',
          'typo-t4 font-medium px-2.5 py-1 flex items-center gap-x-1 rounded-full cursor-pointer',
          'border stroke-0 outline-0',
          'transition-colors duration-1000 ease-in-out',
          activeStatusDropdown.currentValue !== 'all-conversation'
            ? 'bg-primary-50 text-primary-500 border-transparent'
            : 'data-[state=open]:bg-primary-50 data-[state=open]:text-primary-500 data-[state=open]:border-transparent',
          activeStatusDropdown.currentValue === 'all-conversation' &&
            'data-[state=closed]:bg-gray-50 data-[state=closed]:text-gray-500 data-[state=closed]:border-gray-100',
          '[&[data-state=open]>svg]:rotate-180',
          '[&>svg]:transition-transform [&>svg]:duration-1000 [&>svg]:ease-in-out',
        )}
      >
        {activeStatusDropdown.currentValue === 'all-conversation'
          ? 'All'
          : activeStatusDropdown.selectedItem?.label}
        <Icon name="arrow-down" size={12} />
      </button>

      <button
        className={cn(
          'typo-t4 font-medium px-2.5 py-1 flex items-center gap-x-1 rounded-full border stroke-0 outline-0 cursor-pointer',
          'transition-colors duration-1000 ease-in-out',
          statusDropdown.currentValue !== 'all'
            ? 'bg-primary-50 text-primary-500 border-transparent'
            : 'data-[state=open]:bg-primary-50 data-[state=open]:text-primary-500 data-[state=open]:border-transparent',
          statusDropdown.currentValue === 'all' &&
            'data-[state=closed]:bg-gray-50 data-[state=closed]:text-gray-500 data-[state=closed]:border-gray-100',
          '[&[data-state=open]>svg]:rotate-180',
          '[&>svg]:transition-transform [&>svg]:duration-1000 [&>svg]:ease-in-out',
        )}
      >
        {statusDropdown.currentValue === 'all'
          ? 'Status'
          : statusDropdown.selectedItem?.label}
        <Icon name="arrow-down" size={12} />
      </button>

      <button
        className={cn(
          'group/dropdown shrink-0',
          'typo-t4 font-medium px-2.5 py-1 flex items-center gap-x-1 rounded-full border stroke-0 outline-0 cursor-pointer',
          'transition-colors duration-1000 ease-in-out',
          channelDropdown.currentValues?.some((v: string) => v !== 'all')
            ? 'bg-primary-50 text-primary-500 border-transparent'
            : 'data-[state=open]:bg-primary-50 data-[state=open]:text-primary-500 data-[state=open]:border-transparent',
          channelDropdown.currentValues?.every((v: string) => v === 'all') &&
            'data-[state=closed]:bg-gray-50 data-[state=closed]:text-gray-500 data-[state=closed]:border-gray-100',
        )}
      >
        <Icon name="channels" size={14} />
        Channels
        <Icon
          name="arrow-down"
          size={12}
          className="transition-transform duration-300 group-data-[state=open]/dropdown:rotate-180"
        />
      </button>
    </div>
  );
}
