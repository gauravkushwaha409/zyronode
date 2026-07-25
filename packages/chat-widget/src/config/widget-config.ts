type ChatWidgetConfig = {
  serverUrl: string;
  websocketUrl: string;
  organizationId: string;
};

let config: ChatWidgetConfig | null = null;

export function configureChatWidget(options: ChatWidgetConfig) {
  config = options;
}

export function getConfig(): ChatWidgetConfig {
  if (!config) {
    throw new Error(
      "[chat-widget] Not configured. Call configureChatWidget() before using this package.",
    );
  }
  return config;
}
