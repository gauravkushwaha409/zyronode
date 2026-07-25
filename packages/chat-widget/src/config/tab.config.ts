import type { ChatWidgetTabConfig } from "@/types";
import { ChatWidgetChat } from "@/features";

export const CHAT_WIDGET_TABS: ChatWidgetTabConfig[] = [
  { id: "chat", label: "Chat", component: ChatWidgetChat as React.ComponentType },
];
