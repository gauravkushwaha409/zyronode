import { Avatar, Button, cn, Icon, Typography } from "@package/ui";
import { AIInsight } from "./ai-insight";
import { AssignConversationDialog } from "./assign-conversation-dialog";
import { ConversationAction } from "./conversation-action";
import { ResolveUnresolveDialog } from "./resolve-unresolve-dialog";

function getVisitorChannelIcon(channel: string | null) {
	switch (channel) {
		case "whatsapp":
			return "whatsapp" as const;
		case "messenger":
			return "messenger" as const;
		default:
			return "messenger" as const;
	}
}

interface ConversationHeaderProps {
	conversationUUID: string | null;
	visitorName: string | null;
	channel: string | null;
	status: string | null;
	isOpen?: boolean;
	openDetail?: () => void;
	className?: string;
}

export function ConversationHeader({
	visitorName,
	channel,
	status,
	isOpen,
	openDetail,
	className,
}: ConversationHeaderProps) {
	const isResolved = status === "CLOSED" || status === "resolved";
	const isActive = status === "ACTIVE";
	// Treat ACTIVE as online for demo — mirrors portal visitor.is_online
	const isVisitorOnline = isActive;

	return (
		<div
			className={cn(
				`px-4 h-13.5 flex items-center w-full justify-between border-b border-b-gray-200 bg-white-base ${className ?? ""}`,
			)}
		>
			{/* Left Section */}
			<div className="flex items-center flex-1 min-w-0">
				<div className="size-11 relative rounded-full shrink-0">
					{visitorName ? (
						<Avatar
							className="shrink-0"
							size="xl"
							fallbackType="text"
							fallbackText={visitorName.charAt(0) ?? "U"}
						/>
					) : (
						<Avatar className="shrink-0" size="xl" fallbackType="icon" />
					)}
					<Icon
						size={12}
						name={getVisitorChannelIcon(channel)}
						className="absolute right-0 -translate-x-1/2 bottom-0 border-2 border-white rounded-full bg-white"
					/>
				</div>

				<div className="ml-2.5 max-w-40 flex flex-col w-fit min-w-0">
					<Typography.T3
						className="text-gray-950 truncate break-all wrap-anywhere"
						weight="semibold"
					>
						{visitorName ?? "Unknown User"}
					</Typography.T3>
					<div className="flex items-center gap-x-0.5">
						{isVisitorOnline && (
							<Icon name="dot" size={12} className="text-success-500" />
						)}
						<Typography.T6 weight="medium" className="text-gray-400">
							{isVisitorOnline ? "Online" : "Offline"}
						</Typography.T6>
					</div>
				</div>

				<div className="ml-4 flex items-center gap-x-1 shrink-0">
					<Button
						icon="call"
						size="icon-sm"
						className="text-gray-500"
						variant="ghost"
						showTooltip
						tooltipText="Audio call"
						disabled={isResolved}
					/>
					<Button
						icon="video-call"
						size="icon-sm"
						className="text-gray-500"
						variant="ghost"
						showTooltip
						tooltipText="Video call"
						disabled={isResolved}
					/>
				</div>
			</div>

			{/* Right Section */}
			<div className="flex items-center gap-3 shrink-0">
				<AIInsight />
				<div className="w-px bg-gray-100 mx-3 h-6" />
				<AssignConversationDialog />
				{isResolved ? (
					<Button variant="success" leftIcon="resolved" size="xs" className="w-fit">
						Resolved
					</Button>
				) : (
					<ResolveUnresolveDialog />
				)}
				<ConversationAction />
				{isOpen === false && openDetail && (
					<Button variant="ghost" size="icon" onClick={openDetail}>
						<Icon name="contacts" className="h-5 w-5" />
					</Button>
				)}
			</div>
		</div>
	);
}
