import { useState } from "react";
import { ChatWidgetChat, WidgetHeader, WidgetToggle } from "./features";
import { getConversationId } from "./lib/storage";
import { ChatWidgetProvider } from "./provider/chat-widget-provider";
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
	const { activeTab } = useChatWidgetStore();

	const conversationId = getConversationId();

	return (
		<ChatWidgetProvider
			organizationId={organizationId}
			page={page}
			referrer={referrer}
		>
			{isWidgetOpen && (
				<section className="fixed inset-0 z-10000 bg-white shadow-2xl md:bottom-24 md:right-6 md:left-auto md:top-auto md:h-[34rem] md:w-[22rem] md:rounded-[16px] md:border md:border-gray-200 overflow-hidden">
					<section className="h-full flex flex-col">
						<WidgetHeader onClose={() => setWidgetOpen(false)} />
						<section className="flex-1 flex flex-col overflow-hidden">
							{activeTab === "chat" && (
								<ChatWidgetChat conversationId={conversationId} />
							)}
							<p className="py-3 text-gray-500 text-xs text-center">
								Powered by <span className="font-semibold text-blue-600">ChatApp</span>
							</p>
						</section>
					</section>
				</section>
			)}
			<WidgetToggle onClick={() => setWidgetOpen((prev) => !prev)} />
		</ChatWidgetProvider>
	);
}
