import { ChatWidgetChat } from "@/features";
import type { ChatWidgetTabConfig } from "@/types";

export const CHAT_WIDGET_TABS: ChatWidgetTabConfig[] = [
	{
		id: "chat",
		label: "Chat",
		component: ChatWidgetChat as React.ComponentType,
	},
];
