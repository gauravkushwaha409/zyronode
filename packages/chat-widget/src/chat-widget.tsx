import { useState } from "react";
import { ChatWidgetChat, WidgetHeader, WidgetToggle } from "./features";
import {
	ConversationProvider,
	WidgetQueryProvider,
	WidgetSseProvider,
	WidgetWebSocketProvider,
} from "./provider";
import { useChatWidgetStore } from "./store";

interface ChatWidgetProps {
	organizationId?: string;
	page?: string;
	referrer?: string;
}

export default function ChatWidget({
	organizationId,
	page,
	referrer,
}: ChatWidgetProps) {
	const [isWidgetOpen, setWidgetOpen] = useState(false);

	return (
		<WidgetQueryProvider>
			<ConversationProvider organizationId={organizationId}>
				{isWidgetOpen && (
					// SSE/WS connect lazily - only while the widget is open
					<WidgetSseProvider>
						<WidgetWebSocketProvider>
							<WidgetWindow onClose={() => setWidgetOpen(false)} />
						</WidgetWebSocketProvider>
					</WidgetSseProvider>
				)}
				<WidgetToggle onClick={() => setWidgetOpen((prev) => !prev)} />
			</ConversationProvider>
		</WidgetQueryProvider>
	);
}

/**
 * Rendered only while the widget is open.
 *
 * Lazy conversation: no network call until visitor sends first message.
 * ChatWidgetChat handles empty state + lazy creation via ConversationProvider.ensureConversation().
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
						Powered by{" "}
						<span className="font-semibold text-blue-600">ChatApp</span>
					</p>
				</section>
			</section>
		</section>
	);
}
