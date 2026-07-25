import { ChatWidget, configureChatWidget } from "@package/chat-widget";
import { useMemo } from "react";

declare global {
  const __APP_CONFIG__: {
    server_url: string;
    websocket_url: string;
    organization_id: string;
  };
}

export function App() {
  const visitorUuid = useMemo(() => crypto.randomUUID(), []);

  configureChatWidget({
    serverUrl: __APP_CONFIG__.server_url,
    websocketUrl: __APP_CONFIG__.websocket_url,
    organizationId: __APP_CONFIG__.organization_id,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Chat Widget Test</h1>
          <p className="mt-2 text-gray-500">
            Click the chat button in the bottom-right corner to test.
          </p>
          <div className="mt-6 p-4 bg-white rounded-lg shadow text-sm text-left max-w-md">
            <p className="font-mono text-gray-600">
              Visitor: <span className="text-blue-600">{visitorUuid}</span>
            </p>
            <p className="font-mono text-gray-600 mt-1">
              Server: <span className="text-blue-600">{__APP_CONFIG__.server_url}</span>
            </p>
            <p className="font-mono text-gray-600 mt-1">
              Org: <span className="text-blue-600">{__APP_CONFIG__.organization_id || "(not set)"}</span>
            </p>
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
