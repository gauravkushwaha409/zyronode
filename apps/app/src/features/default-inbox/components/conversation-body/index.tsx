import type React from 'react';
import { useRef } from 'react';
import { useInboxSessionDetailQuery } from '../../hooks';
import type { InboxMessage } from '../../types/inbox-api.types';
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
  organizationId: string;
}

export function ConversationBody({ conversationUUID, organizationId }: ConversationBodyProps) {
  const textEditorContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useInboxSessionDetailQuery(conversationUUID, organizationId);

  const messages = (data?.data?.data?.messages ?? []).map((msg: InboxMessage) => ({
    uuid: msg.id,
    conversation_uuid: msg.sessionId,
    sender_type: msg.senderType.toLowerCase() as 'visitor' | 'agent' | 'system',
    content: msg.content,
    message_type: msg.messageType.toLowerCase().replace('INTERNAL_NOTE', 'internal_note') as 'text' | 'file' | 'internal_note',
    sender: {
      id: 0,
      type: msg.senderType.toLowerCase() as 'visitor' | 'agent' | 'system',
      full_name: msg.senderType === 'VISITOR' ? 'Visitor' : msg.senderType === 'AGENT' ? 'Agent' : 'System',
      avatar: null,
      bg_color: null,
      email: null,
    },
    reply_to: msg.replyTo
      ? {
          uuid: msg.replyTo.id,
          content: msg.replyTo.content,
          sender: { id: 0, type: msg.replyTo.senderType.toLowerCase() as 'visitor' | 'agent' | 'system', full_name: '', avatar: null, bg_color: null, email: null },
        }
      : null,
    attachments: null,
    is_edited: msg.isEdited,
    edited_at: msg.editedAt,
    status: msg.status.toLowerCase() as 'sent' | 'delivered' | 'read',
    created_at: msg.createdAt,
  }));

  const messageGroups = groupMessagesByDate(messages);

  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden px-4 pt-4">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500" />
        </div>
      ) : (
        <ConversationMessage
          groups={messageGroups}
          className="flex-1 overflow-y-auto scrollbar-none"
          textEditorHeight={textEditorContainerRef.current?.clientHeight ?? 0}
          scrollRef={scrollRef}
          topSentinelRef={topSentinelRef}
          isFetchingNextPage={false}
        />
      )}

      {conversationUUID && (
        <TextEditor
          ref={textEditorContainerRef}
          conversationUUID={conversationUUID}
          organizationId={organizationId}
        />
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

      {groups.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-gray-400">No messages yet</p>
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
