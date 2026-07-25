export interface ConversationDetailsVisitor {
  id: number;
  uuid: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  external_id: string;
  is_identified: boolean;
}

export interface ConversationDetailsAssignedUser {
  id: number;
  uuid: string;
  full_name: string;
  avatar: string | null;
  avatar_bg: string;
  email: string;
}

export interface ConversationDetailsData {
  id: number;
  uuid: string;
  channel: string;
  is_resolved: boolean;
  last_message_at: string;
  created_at: string;
  updated_at: string | null;
  assigned_agent_id: number | null;
  visitor_id: number;
  visitor: ConversationDetailsVisitor;
  assigned_user: ConversationDetailsAssignedUser | null;
}
