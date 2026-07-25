import { useQueryClient } from "@package/query";
import { Button } from "@package/ui";
import { useEffect, useRef, useState } from "react";
import { useGetMessagesQuery, useSendMessageMutation } from "@/hooks";
import { useOnMessageNew, useTypingIndicator } from "@/hooks/events";
import { WIDGET_QUERY_KEYS } from "@/hooks/query-keys";
import { useChatWidgetStore } from "@/store";
import type { ChatMessage } from "@/types";

interface ChatWidgetChatProps {
  sessionId: string | null;
}

export default function ChatWidgetChat({ sessionId }: ChatWidgetChatProps) {
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messagesData, isLoading } = useGetMessagesQuery(
    sessionId ?? undefined,
  );
  const { mutate: sendMessage, isPending: isSending } = useSendMessageMutation(
    sessionId ?? "",
  );

  const { startTyping, stopTyping, isAgentTyping } = useTypingIndicator({
    sessionId,
  });

  useOnMessageNew(sessionId ?? "", () => {
    if (!sessionId) return;
    queryClient.invalidateQueries({
      queryKey: WIDGET_QUERY_KEYS.MESSAGES(sessionId),
    });
  });

  const messages = messagesData?.data?.data?.messages ?? [];
  const reversed = [...messages].reverse();

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!content.trim() || !sessionId || isSending) return;
    stopTyping();
    sendMessage(
      { content: content.trim(), messageType: "TEXT" },
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
        {reversed.map((msg: ChatMessage) => (
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
              <p dangerouslySetInnerHTML={{ __html: msg.content }} />
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
          disabled={!content.trim() || isSending}
          className="w-full"
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
