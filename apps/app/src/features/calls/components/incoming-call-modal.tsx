import { Avatar, Button, Icon, Typography } from "@package/ui";
import { useCallActions } from "../providers/call-actions-context";
import { useCallStore } from "../store/use-call.store";

export function IncomingCallModal() {
	const incoming = useCallStore((s) => s.incoming);
	const phase = useCallStore((s) => s.phase);
	const { acceptCall, declineCall } = useCallActions();

	if (phase !== "incoming" || !incoming) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
			<div className="w-[320px] rounded-2xl bg-white p-6 flex flex-col items-center gap-4 shadow-xl">
				<div className="relative">
					<Avatar size="xl" fallbackType="text" fallbackText="?" />
					<span className="absolute inset-0 rounded-full animate-ping bg-primary-500/20" />
				</div>
				<div className="flex flex-col items-center gap-1">
					<Typography.T3 weight="semibold" className="text-gray-950">
						Incoming {incoming.type === "VIDEO" ? "video" : "audio"} call
					</Typography.T3>
					<Typography.T5 className="text-gray-500">Ringing…</Typography.T5>
				</div>
				<div className="flex items-center gap-4">
					<Button
						variant="alert"
						size="icon"
						onClick={declineCall}
						showTooltip
						tooltipText="Decline"
						aria-label="Decline call"
					>
						<Icon name="call" className="rotate-[135deg]" />
					</Button>
					<Button
						variant="success"
						size="icon"
						onClick={() => void acceptCall()}
						showTooltip
						tooltipText="Accept"
						aria-label="Accept call"
					>
						<Icon name="call" />
					</Button>
				</div>
			</div>
		</div>
	);
}
