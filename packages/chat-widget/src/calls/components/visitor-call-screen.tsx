import { useEffect, useRef, useState } from "react";
import { useVisitorCallActions } from "../providers/visitor-call-actions-context";
import {
	useVisitorCallStore,
	type VisitorRemotePeer,
} from "../store/use-visitor-call.store";

function useCallTimer(startedAt: number | null, active: boolean): string {
	const [, tick] = useState(0);
	useEffect(() => {
		if (!active || !startedAt) return;
		const timer = window.setInterval(() => tick((n) => n + 1), 1000);
		return () => window.clearInterval(timer);
	}, [active, startedAt]);
	if (!startedAt) return "00:00";
	const secs = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
	return `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
}

function PeerVideo({
	stream,
	muted,
	label,
	mirrored,
	videoOn,
}: {
	stream: MediaStream | null;
	muted: boolean;
	label: string;
	mirrored?: boolean;
	videoOn: boolean;
}) {
	const ref = useRef<HTMLVideoElement>(null);
	useEffect(() => {
		if (ref.current) ref.current.srcObject = stream;
	}, [stream]);
	if (!stream || !videoOn) {
		return (
			<div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-900">
				<div className="size-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
					{label.charAt(0)}
				</div>
				<p className="text-xs text-gray-300">{label}</p>
			</div>
		);
	}
	return (
		<video
			ref={ref}
			autoPlay
			playsInline
			muted={muted}
			className={`w-full h-full object-cover ${mirrored ? "scale-x-[-1]" : ""}`}
		/>
	);
}

function ControlButton({
	onClick,
	label,
	active,
	children,
}: {
	onClick: () => void;
	label: string;
	active?: boolean;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			title={label}
			className={`size-11 rounded-full flex items-center justify-center text-white ${
				active ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
			}`}
		>
			{children}
		</button>
	);
}

export function VisitorCallScreen() {
	const phase = useVisitorCallStore((s) => s.phase);
	const type = useVisitorCallStore((s) => s.type);
	const peers = useVisitorCallStore((s) => s.peers);
	const localStream = useVisitorCallStore((s) => s.localStream);
	const localAudio = useVisitorCallStore((s) => s.localAudio);
	const localVideo = useVisitorCallStore((s) => s.localVideo);
	const error = useVisitorCallStore((s) => s.error);
	const endedReason = useVisitorCallStore((s) => s.endedReason);
	const startedAt = useVisitorCallStore((s) => s.startedAt);
	const { hangUp, toggleAudio, toggleVideo, dismissEnded } =
		useVisitorCallActions();

	const timer = useCallTimer(startedAt, phase === "active");
	const peerList: VisitorRemotePeer[] = Object.values(peers);
	const inCall = phase === "active" || phase === "outgoing";

	if (!inCall && !error && !endedReason) return null;

	return (
		<div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 p-4">
			<div className="w-full max-w-md rounded-2xl bg-gray-950 p-4 flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<p className="text-sm font-semibold text-white">
						{phase === "outgoing" || (phase === "active" && peerList.length === 0)
							? "Ringing…"
							: `${type === "VIDEO" ? "Video" : "Audio"} call`}
					</p>
					<p className="text-xs text-gray-400 tabular-nums">{timer}</p>
				</div>

				{error && (
					<div className="rounded-lg bg-red-500/15 px-3 py-2 flex items-center justify-between gap-2">
						<p className="text-xs text-red-300">{error}</p>
						<button
							type="button"
							className="text-red-300 underline text-xs shrink-0"
							onClick={dismissEnded}
						>
							Dismiss
						</button>
					</div>
				)}
				{endedReason && !error && (
					<div className="rounded-lg bg-gray-800 px-3 py-2">
						<p className="text-xs text-gray-300">
							Call ended ({endedReason.toLowerCase()})
						</p>
					</div>
				)}

				<div
					className={`grid gap-2 ${peerList.length + 1 > 2 ? "grid-cols-2" : "grid-cols-1"}`}
				>
					<div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
						<PeerVideo
							stream={localStream}
							muted
							label="You"
							mirrored
							videoOn={type === "VIDEO" && localVideo}
						/>
						<div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5">
							<p className="text-[11px] text-white">You</p>
						</div>
					</div>
					{peerList.map((peer) => (
						<div
							key={peer.peerId}
							className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video"
						>
							<PeerVideo
								stream={peer.stream}
								muted={false}
								label="Agent"
								videoOn={peer.video}
							/>
							<div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5">
								<p className="text-[11px] text-white">Agent</p>
							</div>
						</div>
					))}
				</div>

				<div className="flex items-center justify-center gap-3">
					<ControlButton
						onClick={toggleAudio}
						label={localAudio ? "Mute" : "Unmute"}
						active={localAudio}
					>
						<svg
							viewBox="0 0 24 24"
							className="size-5"
							fill="currentColor"
							aria-hidden
						>
							<path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm7-3a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-1.06A9 9 0 0 0 21 12h-2Z" />
						</svg>
					</ControlButton>
					{type === "VIDEO" && (
						<ControlButton
							onClick={toggleVideo}
							label={localVideo ? "Camera off" : "Camera on"}
							active={localVideo}
						>
							<svg
								viewBox="0 0 24 24"
								className="size-5"
								fill="currentColor"
								aria-hidden
							>
								<path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4Z" />
							</svg>
						</ControlButton>
					)}
					<button
						type="button"
						onClick={hangUp}
						aria-label="Hang up"
						title="Hang up"
						className="size-11 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
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
				</div>
			</div>
		</div>
	);
}
