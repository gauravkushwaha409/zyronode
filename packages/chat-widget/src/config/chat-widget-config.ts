type ChatWidgetConfig = {
	serverUrl: string;
	organizationId: string;
};

let config: ChatWidgetConfig | null = null;

export function configureChatWidget(options: ChatWidgetConfig) {
	config = options;
}

/**
 * Plain accessor for the configured widget options. Use outside React
 * (services, module singletons); inside components use `useChatWidgetConfig`.
 */
export function getChatWidgetConfig(): ChatWidgetConfig {
	if (!config) {
		throw new Error(
			"[chat-widget] Not configured. Call configureChatWidget() before using this package.",
		);
	}
	return config;
}

/** React-facing alias of `getChatWidgetConfig` for use inside components. */
export function useChatWidgetConfig(): ChatWidgetConfig {
	return getChatWidgetConfig();
}
