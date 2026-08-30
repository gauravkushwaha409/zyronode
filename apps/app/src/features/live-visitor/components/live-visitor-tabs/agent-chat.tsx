import { Button, cn, EmptyState, Icon, Typography } from "@package/ui";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	useCreateConversationMutation,
	useSendAgentMessageMutation,
} from "@/features/default-inbox/hooks/mutations";
import { useInboxConversationDetailQuery } from "@/features/default-inbox/hooks/queries";
import { useVisitorInfoQuery } from "../../hooks";
import type { VisitorInfo } from "../../types";
import { skeletonKeys, visitorDisplayName } from "../../utility";

interface AgentChatProps {
	organizationId: string;
	visitorId: string | null;
}

/**
 * Reuses the inbox conversation detail query and send-message mutation
 * rather than duplicating a second message pipeline for visitors.
 */
export function AgentChat({ organizationId, visitorId }: AgentChatProps) {
	const { data: infoData, isLoading: infoLoading } = useVisitorInfoQuery(
		organizationId,
		visitorId,
	);
	const visitor = infoData?.data?.data;

	// most recently updated conversation is the one an agent wants to reply in
	const initialConversationId = useMemo(
		() => visitor?.conversations?.[0]?.id ?? null,
		[visitor],
	);

	if (!visitorId) {
		return (
			<EmptyState
				size="sm"
				icon="all-conversation"
				title="Select a visitor"
				description="Pick a visitor from the Overview tab to see their conversation."
			/>
		);
	}

	if (infoLoading) {
		return <div className="h-64 animate-pulse rounded-[10px] bg-gray-100" />;
	}

	return (
		<ConversationThread
			initialConversationId={initialConversationId}
			organizationId={organizationId}
			visitor={visitor}
		/>
	);
}

function ConversationThread({
	initialConversationId,
	organizationId,
	visitor,
}: {
	initialConversationId: string | null;
	organizationId: string;
	visitor: VisitorInfo | undefined;
}) {
	// holds the active conversation; a visitor with no conversation yet gets
	// one created on the first send.
	const [conversationId, setConversationId] = useState<string | null>(
		initialConversationId,
	);
	const [draft, setDraft] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	const { data, isLoading } = useInboxConversationDetailQuery(
		conversationId,
		organizationId,
	);
	const sendMessage = useSendAgentMessageMutation(organizationId);
	const createConversation = useCreateConversationMutation(organizationId);

	// the API returns newest-first; render oldest-first like a chat log
	const messages = useMemo(() => {
		const list = data?.data?.data?.messages ?? [];
		return [...list].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		);
	}, [data]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally keyed off the message count, not the ref identity
	useEffect(() => {
		const node = scrollRef.current;
		if (node) node.scrollTo({ top: node.scrollHeight });
	}, [messages.length]);

	const handleSend = async () => {
		const content = draft.trim();
		if (!content) return;

		let targetConversationId = conversationId;

		// no conversation yet for this visitor - create one, then send the message
		if (!targetConversationId) {
			const created = await createConversation.mutateAsync({
				organizationId,
				visitorId: visitor?.id,
				visitorName: visitor?.name ?? null,
				visitorEmail: visitor?.email ?? null,
				visitorPhone: visitor?.phone ?? null,
				sourceUrl: visitor?.sourceUrl ?? undefined,
				channel: "web",
			});
			const createdId = created.data?.data?.id;
			if (!createdId) return;
			targetConversationId = createdId;
			setConversationId(createdId);
		}

		sendMessage.mutate(
			{ conversationId: targetConversationId, content },
			{ onSuccess: () => setDraft("") },
		);
	};

	const canSend =
		draft.trim().length > 0 &&
		!sendMessage.isPending &&
		!createConversation.isPending;

	return (
		<div className="flex h-[26rem] flex-col overflow-hidden rounded-[12px] border border-gray-border-200 bg-white-base">
			<div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4">
				{isLoading && (
					<div className="flex flex-col gap-3">
						{skeletonKeys(4, "bubble").map((key, index) => (
							<div
								key={key}
								className={cn(
									"h-10 w-2/3 animate-pulse rounded-lg bg-gray-100",
									index % 2 === 1 && "ml-auto",
								)}
							/>
						))}
					</div>
				)}

				{!isLoading && messages.length === 0 && (
					<EmptyState
						size="sm"
						icon="all-conversation"
						title={conversationId ? "No messages yet" : "Start the conversation"}
						description={
							conversationId
								? undefined
								: `Type a message to start a conversation with ${
										visitor ? visitorDisplayName(visitor) : "this visitor"
								  }.`
						}
					/>
				)}

				{!isLoading && messages.length > 0 && (
					<ul className="flex flex-col gap-3">
						{messages.map((message) => {
							const isAgent = message.senderType === "AGENT";
							return (
								<li
									key={message.id}
									className={cn("flex", isAgent ? "justify-end" : "justify-start")}
								>
									<div
										className={cn(
											"max-w-[75%] rounded-[10px] px-3 py-2",
											isAgent
												? "bg-primary-500 text-white-base"
												: "bg-gray-100 text-gray-950",
										)}
									>
										<Typography.T4 className="whitespace-pre-wrap break-words">
											{message.content}
										</Typography.T4>
										<Typography.T6
											className={cn(
												"mt-1 block",
												isAgent ? "text-primary-100" : "text-gray-500",
											)}
										>
											{format(new Date(message.createdAt), "HH:mm")}
										</Typography.T6>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			<div className="flex items-end gap-2 border-t border-gray-border-200 p-3">
				<textarea
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={(event) => {
						// Enter sends, Shift+Enter makes a newline
						if (event.key === "Enter" && !event.shiftKey) {
							event.preventDefault();
							void handleSend();
						}
					}}
					rows={1}
					placeholder={
						conversationId ? "Write a reply…" : "Start a conversation…"
					}
					className="max-h-28 min-h-9 flex-1 resize-none rounded-[6px] border border-gray-border-200 px-3 py-2 typo-t4 text-gray-950 outline-none placeholder:text-gray-500 focus:border-primary-500"
				/>
				<Button
					size="icon-sm"
					className="w-auto shrink-0"
					disabled={!canSend}
					isPending={sendMessage.isPending || createConversation.isPending}
					onClick={() => void handleSend()}
					aria-label="Send reply"
				>
					<Icon name="send" size={16} />
				</Button>
			</div>
		</div>
	);
}
