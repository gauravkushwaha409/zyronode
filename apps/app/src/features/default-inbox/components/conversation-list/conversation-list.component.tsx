import { cn } from '@package/ui';
import type React from 'react';
import { useRef } from 'react';
import { useInboxConversationsQuery } from '../../hooks';
import type { InboxConversationListItem } from '../../types/inbox-api.types';
import { ConversationListItem } from './conversation-list-item';

type ConversationListWrapperProps = Pick<React.ComponentProps<'div'>, 'className'>;

interface ConversationListComponentProps extends ConversationListWrapperProps {
  organizationId: string;
}

export function ConversationListComponent({ className, organizationId }: ConversationListComponentProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useInboxConversationsQuery(organizationId);

  const conversations: InboxConversationListItem[] = data?.data?.data?.conversations ?? [];

  if (isLoading) {
    return (
      <div className={cn('px-3 flex items-center justify-center py-8', className)}>
        <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('px-3 py-8 text-center', className)}>
        <p className="text-sm text-gray-500">Failed to load conversations</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={cn('px-3 py-8 text-center', className)}>
        <p className="text-sm text-gray-500">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className={cn('px-3', className)}>
      {conversations.map((conversation) => (
        <ConversationListItem key={conversation.id} {...conversation} />
      ))}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
