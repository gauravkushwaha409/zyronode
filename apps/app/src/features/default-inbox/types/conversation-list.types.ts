import type { AIStatus, ConversationChannel, ConversationPriority, ConversationStatus } from './inbox.union.types';

export interface Visitor {
  id: number;
  uuid: string;
  name: string;
  email: string | null;
  phone: string | null;
  external_id: string;
  is_identified: boolean;
}

export interface ConversationListItem {
  id: number;
  uuid: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  channel: ConversationChannel;
  visitor_id: number;
  assigned_agent_id: number | null;
  first_message_at: string;
  last_message_at: string;
  message_count: number;
  unread_count_agent: number;
  unread_count_visitor: number;
  last_message_snippet: string | null;
  last_message_type: string | null;
  last_sender_name: string | null;
  tags: string[];
  summary: string | null;
  category: string | null;
  sentiment: string | null;
  language: string | null;
  ai_status: AIStatus | null;
  created_at: string;
  visitor: Visitor;
}
