import { Icon, Typography } from "@package/ui";
import { formatDistanceToNowStrict } from "date-fns";
import {
	type CallHistoryItem,
	useCallHistoryQuery,
} from "../hooks/queries/use-call-history.query";

function outcomeLabel(item: CallHistoryItem): string {
	if (item.status !== "ENDED") return "In progress";
	switch (item.endReason) {
		case "MISSED":
			return "Missed";
		case "REJECTED":
			return "Declined";
		case "CANCELLED":
			return "Cancelled";
		case "FAILED":
			return "Failed";
		default: {
			const mm = Math.floor(item.durationSeconds / 60);
			const ss = String(item.durationSeconds % 60).padStart(2, "0");
			return `${mm}:${ss}`;
		}
	}
}

export function CallHistory({ conversationId }: { conversationId: string }) {
	const { data, isPending } = useCallHistoryQuery(conversationId);
	const items = data?.data.data.items ?? [];

	return (
		<div className="border-b border-gray-100">
			<div className="px-3 py-2.5">
				<Typography.T5 className="text-gray-600" weight="medium">
					Calls
				</Typography.T5>
			</div>
			<div className="pb-2 px-3 flex flex-col gap-1.5">
				{isPending && (
					<Typography.T5 className="text-gray-400">Loading…</Typography.T5>
				)}
				{!isPending && items.length === 0 && (
					<Typography.T5 className="text-gray-400">No calls yet</Typography.T5>
				)}
				{items.map((item) => (
					<div key={item.id} className="flex items-center gap-2">
						<Icon
							name={item.type === "VIDEO" ? "video-call" : "call"}
							size={14}
							className="text-gray-400 shrink-0"
						/>
						<Typography.T5 className="text-gray-600 truncate">
							{outcomeLabel(item)} · {item.participants.length} participant
							{item.participants.length === 1 ? "" : "s"}
						</Typography.T5>
						<Typography.T6 className="text-gray-400 ml-auto shrink-0">
							{formatDistanceToNowStrict(new Date(item.startedAt), {
								addSuffix: true,
							})}
						</Typography.T6>
					</div>
				))}
			</div>
		</div>
	);
}
