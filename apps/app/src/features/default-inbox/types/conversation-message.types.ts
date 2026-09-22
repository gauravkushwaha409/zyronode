import type { InboxUnionTypes } from '.';
import type { AttachmentMimeType, MessageSenderType, MessageType, SenderType } from './inbox.union.types';

export interface MessageSender {
  id: string | null;
  type: SenderType;
  full_name: string | null;
  avatar: string | null;
  bg_color: string | null;
  email: string | null;
}

export interface MessageAttachment {
  id: number;
  filename: string;
  url: string;
  size_bytes: number;
  mime_type: AttachmentMimeType;
  thumbnail_url: string | null;
}

export interface ReplyToMessage {
  uuid: string;
  content: string;
  sender: MessageSender;
}

export interface ConversationMessage {
  uuid: string;
  conversation_uuid: string;
  sender_type: MessageSenderType;
  content: string;
  message_type: MessageType;
  sender: MessageSender;
  reply_to: ReplyToMessage | null;
  attachments: MessageAttachment[] | null;
  is_edited: boolean;
  edited_at: string | null;
  status: InboxUnionTypes.MessageDeliveryStatus;
  created_at: string;
}

export interface SendMessagePayload {
  content: string;
  message_type?: MessageType;
  reply_to?: string | null;
  attachment_ids?: number[];
  reply_to_message_id?: string;
}
