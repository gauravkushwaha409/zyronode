import { Button } from "@package/ui";
import { useEffect, useRef, useState } from "react";
import { useGetMessagesQuery, useSendMessageMutation } from "@/hooks";
import { useTypingIndicator } from "@/hooks/events";
import { useConversation } from "@/provider";
import type { ChatMessage } from "@/types";

export default function ChatWidgetChat() {
	const {
		conversationId,
		ensureConversation,
		isCreating: isCreatingConversation,
	} = useConversation();
	const [content, setContent] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	const { data: messagesData, isLoading } = useGetMessagesQuery(
		conversationId ?? undefined,
	);
	// dynamic mutation — conversationId passed per-call so it works right after lazy creation
	const { mutate: sendMessage, isPending: isSending } = useSendMessageMutation();

	// WS is kept connected at ChatWidget level for typing only; messages are via SSE (WidgetSseListener)
	const { startTyping, stopTyping, isAgentTyping } = useTypingIndicator({
		conversationId,
	});

	const messages = messagesData?.data?.data?.messages ?? [];

	// biome-ignore lint/correctness/useExhaustiveDependencies: <ignore>
	useEffect(() => {
		scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
	}, [messages]);

	/**
	 * handleSend — send message, creating conversation if needed
	 */
	const handleSend = async () => {
		if (!content.trim() || isSending || isCreatingConversation) return;

		const trimmed = content.trim();

		// Step 2: decide — existing conversation or need to create
		let activeId = conversationId;
		if (!activeId) {
			try {
				activeId = await ensureConversation();
			} catch (err) {
				console.error("[chat-widget] Failed to create conversation:", err);
				return;
			}
		}
		if (!activeId) {
			console.error("[chat-widget] No conversationId after ensureConversation");
			return;
		}

		// Step 3: send message to existing (or newly created) conversation
		stopTyping();
		sendMessage(
			{
				conversationId: activeId,
				payload: { content: trimmed, messageType: "TEXT" },
			},
			{
				onSuccess: () => setContent(""),
				onError: (err: unknown) => console.error("Send failed:", err),
			},
		);
	};

	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			<div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
				{isLoading && (
					<p className="text-gray-500 text-center text-sm">Loading messages...</p>
				)}
				{!isLoading && messages.length === 0 && (
					<p className="text-gray-500 text-center text-sm">
						No messages yet. Start the conversation!
					</p>
				)}
				{messages.map((msg: ChatMessage) => (
					<div
						key={msg.id}
						className={`flex ${msg.senderType === "VISITOR" ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
								msg.senderType === "VISITOR"
									? "bg-blue-600 text-white rounded-br-none"
									: "bg-gray-100 text-gray-900 rounded-bl-none"
							}`}
						>
							{/** biome-ignore lint/security/noDangerouslySetInnerHtml: <ignore> */}
							<div dangerouslySetInnerHTML={{ __html: msg.content }} />
							<p className="text-[10px] opacity-70 mt-1">
								{new Date(msg.createdAt).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</p>
						</div>
					</div>
				))}
			</div>
			{isAgentTyping && (
				<div className="px-4 py-1">
					<p className="text-gray-400 text-xs italic">Agent is typing...</p>
				</div>
			)}
			<div className="border-t border-gray-200 p-3 flex flex-col gap-2">
				<textarea
					value={content}
					onChange={(e) => {
						setContent(e.target.value);
						startTyping();
					}}
					onBlur={stopTyping}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSend();
						}
					}}
					placeholder="Type a message..."
					className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
					rows={2}
				/>
				<Button
					type="button"
					onClick={handleSend}
					disabled={!content.trim() || isSending || isCreatingConversation}
					className="w-full"
				>
					{isSending || isCreatingConversation
						? isCreatingConversation
							? "Starting chat..."
							: "Sending..."
						: "Send"}
				</Button>
			</div>
		</div>
	);
}
