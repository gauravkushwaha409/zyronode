import { Typography } from "@package/ui";
import {
	useConversationItem,
	useInboxConversationDetailQuery,
} from "../../hooks";
import { ConversationSocketEvents } from "../../hooks/use-conversation-socket-events";
import { ConversationBody } from "../conversation-body";
import { ConversationHeader } from "./conversation-header";

interface ConversationProps {
	organizationId: string;
}

export function Conversation({ organizationId }: ConversationProps) {
	const { value: conversationUUID } = useConversationItem();

	const { data: conversationData } = useInboxConversationDetailQuery(
		conversationUUID,
		organizationId,
	);
	const conversation = conversationData?.data?.data;

	if (!conversationUUID) {
		return (
			<div className="flex items-center justify-center h-full">
				<Typography.T3 className="text-gray-400">
					Select a conversation
				</Typography.T3>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-gray-active-1 inbox-bg-dot-grid">
			<ConversationSocketEvents conversationId={conversationUUID} />
			<ConversationHeader
				conversationUUID={conversationUUID}
				visitorName={conversation?.visitorName ?? null}
				channel={conversation?.channel ?? null}
				status={conversation?.status ?? null}
			/>
			<ConversationBody
				conversationUUID={conversationUUID}
				organizationId={organizationId}
			/>
		</div>
	);
}
