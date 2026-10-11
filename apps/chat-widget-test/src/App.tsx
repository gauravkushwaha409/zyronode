import { ChatWidget, configureChatWidget } from "@package/chat-widget";
import { useMemo } from "react";

// Read straight from Vite env (envDir ../../env) - no `define` indirection.
// Falls back to same-host URLs so the harness works even with a partial env.
const SERVER_URL =
	import.meta.env.VITE_CHAT_WIDGET_SERVER_URL ?? "http://localhost:8000";
const ORGANIZATION_ID = import.meta.env.VITE_ORGANIZATION_ID ?? "";

export function App() {
	const visitorUuid = useMemo(() => crypto.randomUUID(), []);

	configureChatWidget({
		serverUrl: SERVER_URL,
		organizationId: ORGANIZATION_ID,
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
              Server: <span className="text-blue-600">{SERVER_URL}</span>
            </p>
            <p className="font-mono text-gray-600 mt-1">
              Org: <span className="text-blue-600">{ORGANIZATION_ID || "(not set)"}</span>
            </p>
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
