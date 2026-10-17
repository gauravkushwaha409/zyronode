import { useVisitorCallActions, useVisitorCallPhase } from "../../../calls";
import { useVisitorSession } from "../../../provider/visitor-session-context-provider";

interface WidgetHeaderProps {
	onClose: () => void;
}

export function WidgetHeader({ onClose }: WidgetHeaderProps) {
	const {
		conversation: { id: conversationId },
	} = useVisitorSession();
	const { startCall } = useVisitorCallActions();
	const callPhase = useVisitorCallPhase();
	const canCall = Boolean(conversationId) && callPhase === "idle";

	return (
		<section className="p-4 bg-blue-600 text-white rounded-t-[16px]">
			<div className="flex justify-between items-center">
				<h3 className="font-semibold text-sm">Chat Support</h3>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => void startCall("AUDIO")}
						disabled={!canCall}
						aria-label="Voice call"
						title="Voice call"
						className="text-white/80 hover:text-white disabled:opacity-40 p-1 cursor-pointer disabled:cursor-default"
					>
						<svg
							viewBox="0 0 24 24"
							className="size-4"
							fill="currentColor"
							aria-hidden
						>
							<path d="M6.62 10.79a15.53 15.53 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
						</svg>
					</button>
					<button
						type="button"
						onClick={() => void startCall("VIDEO")}
						disabled={!canCall}
						aria-label="Video call"
						title="Video call"
						className="text-white/80 hover:text-white disabled:opacity-40 p-1 cursor-pointer disabled:cursor-default"
					>
						<svg
							viewBox="0 0 24 24"
							className="size-4"
							fill="currentColor"
							aria-hidden
						>
							<path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4Z" />
						</svg>
					</button>
					<button
						type="button"
						onClick={onClose}
						className="text-white/80 hover:text-white text-lg leading-none cursor-pointer"
					>
						&times;
					</button>
				</div>
			</div>
			<p className="text-xs text-white/70 mt-1">
				We typically reply in a few minutes
			</p>
		</section>
	);
}
