import { useDropdownWrapperCheckbox, useDropdownWrapperRadio } from '@package/ui';

export function useConversationActiveStatusFilter() {
  return useDropdownWrapperRadio({
    items: [
      { label: 'All Conversation', value: 'all-conversation', leftIcon: { name: 'all-conversation' as const, size: 16 } },
      { label: 'Assigned to me', value: 'assigned-to-me', leftIcon: { name: 'assignee' as const, size: 16 } },
      { label: 'Unassigned', value: 'unassigned', leftIcon: { name: 'unassigned' as const, size: 16 } },
      { label: 'Mentions', value: 'mentions', leftIcon: { name: 'mentions' as const, size: 16 } },
    ],
    defaultValue: 'all-conversation',
    paramKey: 'active-status',
  });
}

export function useConversationStatusFilter() {
  return useDropdownWrapperRadio({
    items: [
      { label: 'All', value: 'all', leftIcon: { name: 'all-conversation' as const, size: 16 } },
      { label: 'Unread', value: 'unread', leftIcon: { name: 'assignee' as const, size: 16 } },
      { label: 'Unresolved', value: 'pending', leftIcon: { name: 'unassigned' as const, size: 16 } },
      { label: 'Resolved', value: 'closed', leftIcon: { name: 'resolved' as const, size: 16 } },
      { label: 'Snoozed', value: 'snoozed', leftIcon: { name: 'snooze' as const, size: 16 } },
      { label: 'VIP', value: 'vip', leftIcon: { name: 'vip' as const, size: 16 } },
    ],
    defaultValue: 'all',
    paramKey: 'status',
  });
}

export function useCoversationChannelFilter() {
  return useDropdownWrapperCheckbox({
    items: [
      { label: 'All Channels', value: 'all', leftIcon: { name: 'channels' as const, size: 16 } },
      { label: 'WhatsApp', value: 'whatsapp', leftIcon: { name: 'whatsapp' as const, size: 16 } },
      { label: 'Gmail/Email', value: 'gmail', leftIcon: { name: 'email' as const, size: 16 } },
      { label: 'Facebook', value: 'facebook', leftIcon: { name: 'messenger' as const, size: 16 } },
      { label: 'Web', value: 'web', leftIcon: { name: 'messenger' as const, size: 16 } },
    ],
    paramKey: 'channel',
    defaultValues: ['all'],
  });
}

export { useConversationSearchFilter } from './use-conversation-search';
