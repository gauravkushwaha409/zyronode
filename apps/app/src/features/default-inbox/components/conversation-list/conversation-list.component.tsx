import { cn } from '@package/ui';
import type React from 'react';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useInboxConversationsQuery } from '../../hooks';
import { ConversationListItem } from './conversation-list-item';

type ConversationListWrapperProps = Pick<React.ComponentProps<'div'>, 'className'>;

interface ConversationListComponentProps extends ConversationListWrapperProps {
  organizationId: string;
}

export function ConversationListComponent({ className, organizationId }: ConversationListComponentProps) {
  const {
    items: conversations,
    isLoading,
    error,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useInboxConversationsQuery(organizationId,{
    limit: 3
  });

  // Abstracted bidirectional infinite scroll — reusable for any cursor-paginated list
  const { topSentinelRef, bottomSentinelRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
  });

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
      {/* Top sentinel for bidirectional (newer) — loads prev page when scrolled to top */}
      <div ref={topSentinelRef} className="h-1" />
      {isFetchingPreviousPage && (
        <div className="flex justify-center py-2">
          <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500" />
        </div>
      )}
      {conversations.map((conversation: (typeof conversations)[number]) => (
        <ConversationListItem key={conversation.id} {...conversation} />
      ))}
      {/* Bottom sentinel for older (next) */}
      <div ref={bottomSentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500" />
        </div>
      )}
      {!hasNextPage && conversations.length > 0 && (
        <p className="py-2 text-center text-xs text-gray-400">No more conversations</p>
      )}
    </div>
  );
}
