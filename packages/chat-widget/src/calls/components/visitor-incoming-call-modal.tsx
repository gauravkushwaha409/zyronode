import { useVisitorCallActions } from "../providers/visitor-call-actions-context";
import { useVisitorCallStore } from "../store/use-visitor-call.store";

export function VisitorIncomingCallModal() {
	const incoming = useVisitorCallStore((s) => s.incoming);
	const phase = useVisitorCallStore((s) => s.phase);
	const { acceptCall, declineCall } = useVisitorCallActions();

	if (phase !== "incoming" || !incoming) return null;

	return (
		<div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 p-4">
			<div className="w-72 rounded-2xl bg-white p-6 flex flex-col items-center gap-4 shadow-xl">
				<div className="relative">
					<div className="size-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
						A
					</div>
					<span className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
				</div>
				<div className="flex flex-col items-center gap-1 text-center">
					<p className="text-sm font-semibold text-gray-950">Agent is calling</p>
					<p className="text-xs text-gray-500">
						Incoming {incoming.type === "VIDEO" ? "video" : "audio"} call
					</p>
				</div>
				<div className="flex items-center gap-4">
					<button
						type="button"
						onClick={declineCall}
						aria-label="Decline call"
						className="size-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
					>
						<svg
							viewBox="0 0 24 24"
							className="size-5 rotate-[135deg]"
							fill="currentColor"
							aria-hidden
						>
							<path d="M6.62 10.79a15.53 15.53 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
						</svg>
					</button>
					<button
						type="button"
						onClick={() => void acceptCall()}
						aria-label="Accept call"
						className="size-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600"
					>
						<svg
							viewBox="0 0 24 24"
							className="size-5"
							fill="currentColor"
							aria-hidden
						>
							<path d="M6.62 10.79a15.53 15.53 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
