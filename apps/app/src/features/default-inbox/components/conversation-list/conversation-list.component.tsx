import { cn } from '@package/ui';
import type React from 'react';
import { useRef } from 'react';
import { ConversationListItem } from './conversation-list-item';

type ConversationListWrapperProps = Pick<React.ComponentProps<'div'>, 'className'>;

interface ConversationListComponentProps extends ConversationListWrapperProps {}

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    uuid: 'conv-1',
    status: 'open' as const,
    priority: 'medium' as const,
    channel: 'web' as const,
    visitor_id: 1,
    assigned_agent_id: null,
    first_message_at: new Date(Date.now() - 3600000).toISOString(),
    last_message_at: new Date(Date.now() - 600000).toISOString(),
    message_count: 5,
    unread_count_agent: 2,
    unread_count_visitor: 0,
    last_message_snippet: 'Hello, I need help with my order',
    last_message_type: 'text',
    last_sender_name: 'John Doe',
    tags: [],
    summary: null,
    category: null,
    sentiment: null,
    language: null,
    ai_status: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    visitor: { id: 1, uuid: 'vis-1', name: 'John Doe', email: 'john@example.com', phone: null, external_id: 'ext-1', is_identified: true },
  },
  {
    id: 2,
    uuid: 'conv-2',
    status: 'open' as const,
    priority: 'high' as const,
    channel: 'whatsapp' as const,
    visitor_id: 2,
    assigned_agent_id: 1,
    first_message_at: new Date(Date.now() - 86400000).toISOString(),
    last_message_at: new Date(Date.now() - 1800000).toISOString(),
    message_count: 12,
    unread_count_agent: 0,
    unread_count_visitor: 1,
    last_message_snippet: 'Can you help me reset my password?',
    last_message_type: 'text',
    last_sender_name: 'Jane Smith',
    tags: ['support'],
    summary: null,
    category: null,
    sentiment: null,
    language: null,
    ai_status: 'completed' as const,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    visitor: { id: 2, uuid: 'vis-2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567890', external_id: 'ext-2', is_identified: true },
  },
  {
    id: 3,
    uuid: 'conv-3',
    status: 'open' as const,
    priority: 'low' as const,
    channel: 'email' as const,
    visitor_id: 3,
    assigned_agent_id: null,
    first_message_at: new Date(Date.now() - 259200000).toISOString(),
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
    message_count: 3,
    unread_count_agent: 1,
    unread_count_visitor: 0,
    last_message_snippet: 'Looking for pricing information',
    last_message_type: 'text',
    last_sender_name: 'Bob Wilson',
    tags: [],
    summary: null,
    category: null,
    sentiment: null,
    language: null,
    ai_status: null,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    visitor: { id: 3, uuid: 'vis-3', name: 'Bob Wilson', email: 'bob@example.com', phone: null, external_id: 'ext-3', is_identified: false },
  },
];

export function ConversationListComponent({ className }: ConversationListComponentProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn('px-3', className)}>
      {MOCK_CONVERSATIONS.map((conversation) => (
        <ConversationListItem key={conversation.id} {...conversation} />
      ))}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
