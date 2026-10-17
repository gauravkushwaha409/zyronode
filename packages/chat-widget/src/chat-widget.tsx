import { SOCKET_NAMESPACES } from "@package/websocket";
import { Activity, useCallback, useState } from "react";
import { VisitorCallContextProvider } from "./calls";
import { useChatWidgetConfig } from "./config";
import { ChatWidgetChat, WidgetHeader, WidgetToggle } from "./features";
import { useVisitorPresence } from "./hooks/events/ws";
import {
	useVisitorSession,
	VisitorSessionContextProvider,
	WidgetConversationSseProvider,
	WidgetQueryProvider,
	WidgetVisitorSseProvider,
	WidgetWebSocketProvider,
} from "./provider";
import { useChatWidgetStore } from "./store";

export default function ChatWidget() {
	const [isWidgetOpen, setWidgetOpen] = useState(false);
	const unreadCount = useChatWidgetStore((s) => s.unreadCount);
	const clearUnread = useChatWidgetStore((s) => s.clearUnread);

	const { organizationId } = useChatWidgetConfig();

	const handleToggle = useCallback(() => {
		setWidgetOpen((prev) => {
			const next = !prev;
			if (next) clearUnread();
			return next;
		});
	}, [clearUnread]);

	const handleClose = useCallback(() => {
		setWidgetOpen(false);
	}, []);

	console.log("ChatWidget rendered with organizationId:", organizationId);
	return (
		<VisitorSessionContextProvider organizationId={organizationId}>
			<WidgetQueryProvider>
				<VisitorCallContextProvider>
					<WidgetVisitorSseProvider />
					<WidgetWebSocketProvider namespace={SOCKET_NAMESPACES.VISITOR}>
						<WidgetConversationSseProvider isWidgetOpen={isWidgetOpen} />
						<WidgetPresenceEmitter />

						<WidgetWebSocketProvider namespace={SOCKET_NAMESPACES.AGENT_INBOX}>
							<Activity mode={isWidgetOpen ? "visible" : "hidden"}>
								<WidgetWindow onClose={handleClose} />
							</Activity>

							<WidgetToggle onClick={handleToggle} unreadCount={unreadCount} />
						</WidgetWebSocketProvider>
					</WidgetWebSocketProvider>
				</VisitorCallContextProvider>
			</WidgetQueryProvider>
		</VisitorSessionContextProvider>
	);
}

/** Always-mounted: heartbeats visitor:presence over WS regardless of whether the widget is open. */
function WidgetPresenceEmitter() {
	const { organizationId, visitorId } = useVisitorSession();
	useVisitorPresence(organizationId, visitorId);
	return null;
}

/**
 * Rendered only while the widget is open.
 *
 * Lazy conversation: no network call until visitor sends first message.
 * ChatWidgetChat handles empty state + lazy creation via
 * useVisitorSession().conversation.ensure().
 */
function WidgetWindow({ onClose }: { onClose: () => void }) {
	const { activeTab } = useChatWidgetStore();

	return (
		<section className="fixed inset-0 z-[10000] bg-white shadow-2xl md:bottom-24 md:right-6 md:left-auto md:top-auto md:h-[34rem] md:w-[22rem] md:rounded-[16px] md:border md:border-gray-200 overflow-hidden">
			<section className="h-full flex flex-col">
				<WidgetHeader onClose={onClose} />
				<section className="flex-1 flex flex-col overflow-hidden">
					{activeTab === "chat" && <ChatWidgetChat />}
					<p className="py-3 text-gray-500 text-xs text-center">
						Powered by <span className="font-semibold text-blue-600">zyronode</span>
					</p>
				</section>
			</section>
		</section>
	);
}
