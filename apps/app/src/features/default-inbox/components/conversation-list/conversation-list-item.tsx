import { Avatar, cn, Icon, Typography } from "@package/ui";
import { formatDistanceToNowStrict } from "date-fns";
import { useConversationItem } from "../../hooks";
import type { InboxConversationListItem } from "../../types/inbox-api.types";
import { ConversationAction } from "../conversation/conversation-action";

type ConversationListItemProps = InboxConversationListItem;


export function ConversationListItem(props: ConversationListItemProps) {
	const { value: selectedId, onChange: selectConversation } =
		useConversationItem();
	const isSelected = selectedId === props.id;

	const senderLabel =
		props.lastMessage?.senderType === "VISITOR"
			? (props?.visitor?.name ?? "Visitor")
			: props.lastMessage?.senderType === "AGENT"
				? "Agent"
				: "System";

	return (
		<div
			className={cn(
				"group w-full px-3 py-3.5 flex items-center gap-x-2.5 rounded-lg transition-colors cursor-pointer relative",
				isSelected ? "bg-primary-50" : "hover:bg-gray-50",
			)}
			onMouseEnter={() => {
				// hover listener on whole conversation item — drives group-hover swap via CSS
			}}
			onMouseLeave={() => {
				// keep listener for whole-item hover
			}}
		>
			<button
				type="button"
				onClick={() => selectConversation(props.id)}
				className="flex-1 flex items-center gap-x-2.5 min-w-0 text-left"
			>
				<div className="size-11 relative rounded-full shrink-0">
					<Avatar
						className="shrink-0"
						size="xl"
						fallbackType="text"
						fallbackText={props.visitor?.name?.charAt(0) ?? "U"}
						isActive={props.visitor?.isOnline}
						showAvatarBadge={props.visitor?.isOnline}
					/>
					<Icon
						size={16}
						name="messenger"
						className="absolute left-0 -translate-x-1/2 top-0 border-2 border-white rounded-full"
					/>
				</div>

				<div className="flex-1 flex flex-col min-w-0">
					<div className="flex items-center gap-2.5">
						<Typography.T3 weight="semibold" className="text-gray-950 truncate">
							{props.visitor?.name ?? "Unknown Visitor"}
						</Typography.T3>
					</div>

					<div className="flex items-center justify-between gap-x-2.5">
						<Typography.T5 className="text-gray-500 line-clamp-1">
							{props.lastMessage
								? `${senderLabel}: ${props.lastMessage.content}`
								: "No messages yet"}
						</Typography.T5>
					</div>
				</div>
			</button>

			{/* Right side: timestamp + dot share spot with 3-dot; hidden via opacity to avoid layout shift/flicker */}
			<div className="shrink-0 flex items-center gap-x-2">
				<Typography.T6 className="shrink-0 transition-opacity duration-150 group-hover:opacity-0 group-hover:pointer-events-none">
					{formatDistanceToNowStrict(new Date(props.lastMessageAt), {
						addSuffix: false,
					})
						.replace(/ seconds?/, "s")
						.replace(/ minutes?/, "m")
						.replace(/ hours?/, "h")
						.replace(/ days?/, "d")
						.replace(/ months?/, "mo")
						.replace(/ years?/, "y")}
				</Typography.T6>
				<div className="relative size-7 flex items-center justify-center shrink-0">
					{/* Unread dot — same spot as 3-dot, swapped on hover */}
					<div
						className={cn(
							"absolute inset-0 flex items-center justify-center transition-opacity duration-150",
							"group-hover:opacity-0 group-hover:pointer-events-none",
						)}
						aria-hidden
					>
						{props.unreadCount > 0 ? (
							<div className="size-1.5 bg-primary-500 drop-shadow-[0_3px_22.5px_rgba(0,0,0,0.04)] backdrop-blur-[18px] rounded-full" />
						) : (
							<span className="size-1.5" />
						)}
					</div>
					<div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
						<ConversationAction
							conversationId={props.id}
							triggerIconProps={{
								size: "icon-sm",
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
