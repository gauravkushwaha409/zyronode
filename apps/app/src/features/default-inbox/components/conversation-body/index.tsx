import type React from 'react';
import { useRef } from 'react';
import {
  groupConsecutiveMessages,
  groupMessagesByDate,
  type MessageGroup,
} from '../../utility';
import { MessageCluster } from './message-cluster';
import { MessageDeleteDialog } from './message-delete-dialog';
import { TextEditor } from './text-editor';

interface ConversationBodyProps {
  conversationUUID: string | null;
}

export function ConversationBody({ conversationUUID }: ConversationBodyProps) {
  const textEditorContainerRef = useRef<HTMLDivElement>(null);

  const MOCK_MESSAGES = [
    {
      uuid: 'msg-1',
      conversation_uuid: conversationUUID ?? '',
      sender_type: 'visitor' as const,
      content: 'Hello, I need help with my order',
      message_type: 'text' as const,
      sender: { id: 1, type: 'visitor' as const, full_name: 'John Doe', avatar: null, bg_color: null, email: null },
      reply_to: null,
      attachments: null,
      is_edited: false,
      edited_at: null,
      status: 'read' as const,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      uuid: 'msg-2',
      conversation_uuid: conversationUUID ?? '',
      sender_type: 'agent' as const,
      content: 'Hi John! I can help you with that. Can you share your order number?',
      message_type: 'text' as const,
      sender: { id: 2, type: 'agent' as const, full_name: 'Agent Smith', avatar: null, bg_color: null, email: null },
      reply_to: null,
      attachments: null,
      is_edited: false,
      edited_at: null,
      status: 'read' as const,
      created_at: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      uuid: 'msg-3',
      conversation_uuid: conversationUUID ?? '',
      sender_type: 'visitor' as const,
      content: 'My order number is #12345',
      message_type: 'text' as const,
      sender: { id: 1, type: 'visitor' as const, full_name: 'John Doe', avatar: null, bg_color: null, email: null },
      reply_to: null,
      attachments: null,
      is_edited: false,
      edited_at: null,
      status: 'read' as const,
      created_at: new Date(Date.now() - 3400000).toISOString(),
    },
    {
      uuid: 'msg-4',
      conversation_uuid: conversationUUID ?? '',
      sender_type: 'agent' as const,
      content: 'Internal note: Check the warehouse for this order',
      message_type: 'internal_note' as const,
      sender: { id: 2, type: 'agent' as const, full_name: 'Agent Smith', avatar: null, bg_color: null, email: null },
      reply_to: null,
      attachments: null,
      is_edited: false,
      edited_at: null,
      status: 'read' as const,
      created_at: new Date(Date.now() - 3300000).toISOString(),
    },
    {
      uuid: 'msg-5',
      conversation_uuid: conversationUUID ?? '',
      sender_type: 'agent' as const,
      content: 'I found your order. It will be delivered tomorrow.',
      message_type: 'text' as const,
      sender: { id: 2, type: 'agent' as const, full_name: 'Agent Smith', avatar: null, bg_color: null, email: null },
      reply_to: null,
      attachments: null,
      is_edited: false,
      edited_at: null,
      status: 'sent' as const,
      created_at: new Date(Date.now() - 3200000).toISOString(),
    },
  ];

  const messages = MOCK_MESSAGES;
  const messageGroups = groupMessagesByDate(messages);

  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden px-4 pt-4">
      <ConversationMessage
        groups={messageGroups}
        className="flex-1 overflow-y-auto scrollbar-none"
        textEditorHeight={textEditorContainerRef.current?.clientHeight ?? 0}
        scrollRef={scrollRef}
        topSentinelRef={topSentinelRef}
        isFetchingNextPage={false}
      />

      {conversationUUID && (
        <TextEditor ref={textEditorContainerRef} />
      )}

      <MessageDeleteDialog conversationUUID={conversationUUID} />
    </div>
  );
}

type ConversationMessageProps = {
  groups: MessageGroup[];
  textEditorHeight: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  topSentinelRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
} & Pick<React.HTMLAttributes<HTMLDivElement>, 'className'>;

function ConversationMessage({
  className,
  groups,
  textEditorHeight,
  scrollRef,
  topSentinelRef,
  isFetchingNextPage,
}: ConversationMessageProps) {
  return (
    <div ref={scrollRef} className={className}>
      <div ref={topSentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-3">
          <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500" />
        </div>
      )}

      {groups.map((group) => {
        const clusters = groupConsecutiveMessages(group.messages);
        return (
          <div key={group.date} className="mb-4">
            <ConversationDate label={group.label} />
            <div className="mt-3 flex flex-col gap-y-4">
              {clusters.map((cluster, index) => (
                <MessageCluster key={index} cluster={cluster} />
              ))}
            </div>
          </div>
        );
      })}
      <div style={{ height: `${textEditorHeight + 10}px` }} className="w-full" />
    </div>
  );
}

function ConversationDate({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-x-2.5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
