import { cn } from '@package/ui';
import type React from 'react';
import { useRef } from 'react';
import { useInboxSessionsQuery } from '../../hooks';
import type { InboxSessionListItem } from '../../types/inbox-api.types';
import { ConversationListItem } from './conversation-list-item';

type ConversationListWrapperProps = Pick<React.ComponentProps<'div'>, 'className'>;

interface ConversationListComponentProps extends ConversationListWrapperProps {
  organizationId: string;
}

export function ConversationListComponent({ className, organizationId }: ConversationListComponentProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useInboxSessionsQuery(organizationId);

  const sessions: InboxSessionListItem[] = data?.data?.data?.sessions ?? [];

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

  if (sessions.length === 0) {
    return (
      <div className={cn('px-3 py-8 text-center', className)}>
        <p className="text-sm text-gray-500">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className={cn('px-3', className)}>
      {sessions.map((session) => (
        <ConversationListItem key={session.id} {...session} />
      ))}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
