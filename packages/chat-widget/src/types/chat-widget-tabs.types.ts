export type ChatWidgetTab = "chat";

export interface ChatWidgetTabConfig {
  id: ChatWidgetTab;
  label: string;
  component: React.ComponentType;
}
