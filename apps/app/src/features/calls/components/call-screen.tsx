import { Avatar, Button, Icon, Typography } from "@package/ui";
import { useEffect, useRef, useState } from "react";
import { usePeerNames } from "../hooks/use-peer-names";
import { useCallActions } from "../providers/call-actions-context";
import { type RemotePeerState, useCallStore } from "../store/use-call.store";

function useCallTimer(startedAt: number | null, active: boolean): string {
	const [, tick] = useState(0);
	useEffect(() => {
		if (!active || !startedAt) return;
		const timer = window.setInterval(() => tick((n) => n + 1), 1000);
		return () => window.clearInterval(timer);
	}, [active, startedAt]);
	if (!startedAt) return "00:00";
	const secs = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
	const mm = String(Math.floor(secs / 60)).padStart(2, "0");
	const ss = String(secs % 60).padStart(2, "0");
	return `${mm}:${ss}`;
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
				<Avatar
					size="xl"
					fallbackType="text"
					fallbackText={label.charAt(0) ?? "?"}
				/>
				<Typography.T5 className="text-gray-300">{label}</Typography.T5>
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

function PeerTile({ peer, label }: { peer: RemotePeerState; label: string }) {
	return (
		<div className="relative rounded-xl overflow-hidden bg-gray-900 w-full h-full min-h-0">
			<PeerVideo
				stream={peer.stream}
				muted={false}
				label={label}
				videoOn={peer.video}
			/>
			<div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-0.5">
				<Typography.T6 className="text-white">{label}</Typography.T6>
				{!peer.audio && <Icon name="audio" size={12} className="text-alert-400" />}
			</div>
			{peer.connection === "failed" || peer.connection === "disconnected" ? (
				<div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5">
					<Typography.T6 className="text-amber-300">Reconnecting…</Typography.T6>
				</div>
			) : null}
		</div>
	);
}

function DeviceSelectors() {
	const audioDeviceId = useCallStore((s) => s.audioDeviceId);
	const videoDeviceId = useCallStore((s) => s.videoDeviceId);
	const type = useCallStore((s) => s.type);
	const { setAudioDevice, setVideoDevice } = useCallActions();
	const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

	useEffect(() => {
		let live = true;
		const load = async () => {
			try {
				const list = await navigator.mediaDevices.enumerateDevices();
				if (live) setDevices(list);
			} catch {
				// Device labels need prior permission - selectors stay empty.
			}
		};
		void load();
		navigator.mediaDevices.addEventListener("devicechange", load);
		return () => {
			live = false;
			navigator.mediaDevices.removeEventListener("devicechange", load);
		};
	}, []);

	const audioInputs = devices.filter((d) => d.kind === "audioinput");
	const videoInputs = devices.filter((d) => d.kind === "videoinput");
	if (audioInputs.length <= 1 && videoInputs.length <= 1) return null;

	return (
		<div className="flex items-center gap-2">
			{audioInputs.length > 1 && (
				<select
					aria-label="Microphone"
					className="max-w-36 rounded-md bg-gray-800 px-2 py-1 text-xs text-white"
					value={audioDeviceId ?? ""}
					onChange={(e) => void setAudioDevice(e.target.value)}
				>
					<option value="">Default mic</option>
					{audioInputs.map((d, i) => (
						<option key={d.deviceId} value={d.deviceId}>
							{d.label || `Mic ${i + 1}`}
						</option>
					))}
				</select>
			)}
			{type === "VIDEO" && videoInputs.length > 1 && (
				<select
					aria-label="Camera"
					className="max-w-36 rounded-md bg-gray-800 px-2 py-1 text-xs text-white"
					value={videoDeviceId ?? ""}
					onChange={(e) => void setVideoDevice(e.target.value)}
				>
					<option value="">Default camera</option>
					{videoInputs.map((d, i) => (
						<option key={d.deviceId} value={d.deviceId}>
							{d.label || `Camera ${i + 1}`}
						</option>
					))}
				</select>
			)}
		</div>
	);
}

export function CallScreen() {
	const phase = useCallStore((s) => s.phase);
	const type = useCallStore((s) => s.type);
	const peers = useCallStore((s) => s.peers);
	const localStream = useCallStore((s) => s.localStream);
	const localAudio = useCallStore((s) => s.localAudio);
	const localVideo = useCallStore((s) => s.localVideo);
	const isSharingScreen = useCallStore((s) => s.isSharingScreen);
	const error = useCallStore((s) => s.error);
	const endedReason = useCallStore((s) => s.endedReason);
	const startedAt = useCallStore((s) => s.startedAt);
	const {
		hangUp,
		toggleAudio,
		toggleVideo,
		startScreenShare,
		stopScreenShare,
		dismissEnded,
	} = useCallActions();

	const timer = useCallTimer(startedAt, phase === "active");
	const peerList = Object.values(peers);
	const names = usePeerNames(peerList.map((p) => p.userId));
	const inCall = phase === "active" || phase === "outgoing";

	if (!inCall && !error && !endedReason) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
			<div className="w-[min(720px,92vw)] max-h-[88vh] rounded-2xl bg-gray-950 p-4 flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<Typography.T3 weight="semibold" className="text-white">
						{phase === "outgoing" || (phase === "active" && peerList.length === 0)
							? "Ringing…"
							: `${type === "VIDEO" ? "Video" : "Audio"} call · ${peerList.length + 1}`}
					</Typography.T3>
					<Typography.T5 className="text-gray-400 tabular-nums">
						{timer}
					</Typography.T5>
				</div>

				{error && (
					<div className="rounded-lg bg-alert-500/15 px-3 py-2 flex items-center justify-between gap-2">
						<Typography.T5 className="text-alert-300">{error}</Typography.T5>
						<button
							type="button"
							className="text-alert-300 underline text-xs shrink-0"
							onClick={dismissEnded}
						>
							Dismiss
						</button>
					</div>
				)}
				{endedReason && !error && (
					<div className="rounded-lg bg-gray-800 px-3 py-2">
						<Typography.T5 className="text-gray-300">
							Call ended ({endedReason.toLowerCase()})
						</Typography.T5>
					</div>
				)}

				{/* Responsive tile grid: full width for 1-2 tiles, 2 cols for 3-4. */}
				<div
					className={`grid gap-2 min-h-0 flex-1 ${peerList.length + 1 > 2 ? "grid-cols-2" : "grid-cols-1"}`}
				>
					<div className="relative rounded-xl overflow-hidden bg-gray-900 min-h-40 aspect-video">
						<PeerVideo
							stream={localStream}
							muted
							label="You"
							mirrored
							videoOn={type === "VIDEO" && localVideo}
						/>
						<div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5">
							<Typography.T6 className="text-white">
								You{isSharingScreen ? " (sharing screen)" : ""}
							</Typography.T6>
						</div>
					</div>
					{peerList.map((peer) => (
						<div key={peer.userId} className="min-h-0 aspect-video">
							<PeerTile peer={peer} label={names[peer.userId] ?? peer.userId} />
						</div>
					))}
				</div>

				<div className="flex flex-col items-center gap-2">
					<DeviceSelectors />
					<div className="flex items-center gap-3">
						<Button
							size="icon"
							variant={localAudio ? "gray" : "alert"}
							onClick={toggleAudio}
							showTooltip
							tooltipText={localAudio ? "Mute" : "Unmute"}
							aria-label={localAudio ? "Mute microphone" : "Unmute microphone"}
						>
							<Icon name="audio" className={localAudio ? "" : "line-through"} />
						</Button>
						{type === "VIDEO" && (
							<Button
								size="icon"
								variant={localVideo ? "gray" : "alert"}
								onClick={toggleVideo}
								showTooltip
								tooltipText={localVideo ? "Camera off" : "Camera on"}
								aria-label={localVideo ? "Turn camera off" : "Turn camera on"}
							>
								<Icon name="video-call" />
							</Button>
						)}
						{type === "VIDEO" && (
							<Button
								size="icon"
								variant={isSharingScreen ? "default" : "gray"}
								onClick={() => {
									if (isSharingScreen) stopScreenShare();
									else void startScreenShare();
								}}
								showTooltip
								tooltipText={isSharingScreen ? "Stop sharing" : "Share screen"}
								aria-label={isSharingScreen ? "Stop sharing screen" : "Share screen"}
							>
								<Icon name="computer" />
							</Button>
						)}
						<Button
							size="icon"
							variant="alert"
							onClick={hangUp}
							showTooltip
							tooltipText="Hang up"
							aria-label="Hang up"
						>
							<Icon name="call" className="rotate-[135deg]" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
