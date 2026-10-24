import type {
	CallEndReason,
	CallIncomingPayload,
	CallMediaStateRelayPayload,
	CallPeerJoinedPayload,
	CallPeerLeftPayload,
	CallPeersPayload,
	CallType,
	IceCandidatePayload,
	SdpPayload,
	WebrtcAnswerRelayPayload,
	WebrtcIceRelayPayload,
	WebrtcOfferRelayPayload,
} from "@package/call-signaling";
import { ClientCallEvents, ServerCallEvents } from "@package/call-signaling";
import { useQueryClient } from "@package/query";
import { useWebSocket } from "@package/websocket";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMeQuery } from "@/features/auth/hooks/query/use-me.query";
import { callApiService } from "../services/call-api.service";
import { useCallStore } from "../store/use-call.store";
import { toMediaErrorMessage } from "../utility/media-errors";
import { createRingtone } from "../utility/ringtone";

interface PeerConnectionState {
	peerConnection: RTCPeerConnection;
	makingOffer: boolean;
	ignoreOffer: boolean;
	pendingCandidates: IceCandidatePayload[];
	restartAttempts: number;
	disconnectTimer: number | null;
}

const ICE_RESTART_DELAY_MS = 5000;
const MAX_RESTART_ATTEMPTS = 2;

export interface CallActions {
	startCall: (conversationId: string, type: CallType) => Promise<void>;
	acceptCall: () => Promise<void>;
	declineCall: () => void;
	hangUp: () => void;
	toggleAudio: () => void;
	toggleVideo: () => void;
	setAudioDevice: (deviceId: string) => Promise<void>;
	setVideoDevice: (deviceId: string) => Promise<void>;
	startScreenShare: () => Promise<void>;
	stopScreenShare: () => void;
	dismissEnded: () => void;
}

/**
 * Owns all call logic: socket signaling, one RTCPeerConnection per remote
 * peer (mesh), ICE queueing, perfect-negotiation backstop, ICE restart, and
 * full cleanup. UI components stay dumb and read useCallStore.
 */
export function useCallEngine(): CallActions {
	const { client, status } = useWebSocket();
	const queryClient = useQueryClient();

	const clientRef = useRef(client);
	clientRef.current = client;

	console.log("[call] engine mounted, socket status:", status);

	const peerConnections = useRef(new Map<string, PeerConnectionState>());
	const iceServers = useRef<RTCIceServer[] | null>(null);
	const localStreamRef = useRef<MediaStream | null>(null);
	const ringtone = useRef(createRingtone());

	/** True while a call:join ack is in flight (server errors arrive as events). */
	const joiningRef = useRef(false);
	const selfPeerId = useRef<string | null>(null);

	const { data: me } = useMeQuery();
	useEffect(() => {
		const id = me?.data.data.id;
		if (id && !selfPeerId.current) selfPeerId.current = `user:${id}`;
	}, [me]);

	const getStore = useCallStore.getState;

	const cleanupPeer = useCallback((peerId: string) => {
		const entry = peerConnections.current.get(peerId);
		if (entry) {
			if (entry.disconnectTimer !== null)
				window.clearTimeout(entry.disconnectTimer);
			entry.peerConnection.close();
			peerConnections.current.delete(peerId);
		}
		getStore().removePeer(peerId);
	}, []);

	const fullCleanup = useCallback(() => {
		for (const peerId of [...peerConnections.current.keys()])
			cleanupPeer(peerId);
		const { localStream, screenStream } = getStore();
		localStream?.getTracks().forEach((t) => {
			t.stop();
		});
		screenStream?.getTracks().forEach((t) => {
			t.stop();
		});
		ringtone.current.stop();
	}, [cleanupPeer]);

	const endCallUi = useCallback(
		(reason: CallEndReason | null, keepBanner: boolean) => {
			fullCleanup();
			const store = getStore();
			if (keepBanner) {
				store.set({
					phase: "idle",
					callId: null,
					endedReason: reason,
					incoming: null,
					startedAt: null,
				});
				if (reason)
					window.setTimeout(() => getStore().set({ endedReason: null }), 6000);
			} else {
				store.reset();
			}
		},
		[fullCleanup],
	);

	const sendMediaState = useCallback((audio: boolean, video: boolean) => {
		const { callId } = getStore();
		if (!callId || !clientRef.current.connected) return;
		try {
			clientRef.current.emit(ClientCallEvents.MEDIA_STATE, {
				callId,
				audio,
				video,
			});
		} catch {
			// Socket down - flags sync on rejoin via call:peers.
		}
	}, []);

	const attachLocalTracks = useCallback((peerConnection: RTCPeerConnection) => {
		const localStream = localStreamRef.current ?? getStore().localStream;
		localStream?.getTracks().forEach((track) => {
			if (localStream) peerConnection.addTrack(track, localStream);
		});
	}, []);

	const sendOffer = useCallback(async (peerId: string, iceRestart = false) => {
		const entry = peerConnections.current.get(peerId);
		if (!entry) return;
		const { callId } = getStore();
		if (!callId) return;
		try {
			entry.makingOffer = true;
			if (iceRestart) {
				// Fresh ICE gathering on the existing (failed) connection.
				const offer = await entry.peerConnection.createOffer({
					iceRestart: true,
				});
				await entry.peerConnection.setLocalDescription(offer);
			} else {
				const offer = await entry.peerConnection.createOffer();
				await entry.peerConnection.setLocalDescription(offer);
			}
			const desc = entry.peerConnection.localDescription;
			if (!desc) return;
			clientRef.current.emit(ClientCallEvents.OFFER, {
				callId,
				to: peerId,
				sdp: { type: "offer", sdp: desc.sdp },
			});
		} catch (err) {
			console.log("[call] sendOffer error", err);
			// Negotiation collision - the answer path resolves it.
		} finally {
			entry.makingOffer = false;
		}
	}, []);

	const restartIce = useCallback(
		async (peerId: string) => {
			const entry = peerConnections.current.get(peerId);
			if (!entry || entry.restartAttempts >= MAX_RESTART_ATTEMPTS) {
				if (entry) {
					getStore().set({ error: "Connection to a participant was lost." });
				}
				return;
			}
			entry.restartAttempts += 1;
			await sendOffer(peerId, true);
		},
		[sendOffer],
	);

	const createPeerConnection = useCallback(
		(peerId: string): RTCPeerConnection => {
			console.log(
				"[call] agent createPeerConnection",
				peerId,
				"iceServers=",
				iceServers.current?.length,
			);
			cleanupPeer(peerId);
			const peerConnection = new RTCPeerConnection({
				iceServers: iceServers.current ?? undefined,
			});
			peerConnection.onicegatheringstatechange = () =>
				console.log(
					"[icegatheringstatechange]",
					peerConnection.iceGatheringState,
				);
			const entry: PeerConnectionState = {
				peerConnection,
				makingOffer: false,
				ignoreOffer: false,
				pendingCandidates: [],
				restartAttempts: 0,
				disconnectTimer: null,
			};
			peerConnections.current.set(peerId, entry);
			attachLocalTracks(peerConnection);

			peerConnection.ontrack = (event) => {
				const [stream] = event.streams;
				console.log(`[call] ontrack from ${peerId}`, {
					streams: event.streams.length,
					tracks: stream?.getTracks().map((t) => `${t.kind}:${t.readyState}`),
				});
				if (!stream) return;
				const store = getStore();
				const existing = store.peers[peerId];
				store.upsertPeer({
					peerId,
					stream,
					audio: existing?.audio ?? true,
					video: existing?.video ?? true,
					connection: peerConnection.connectionState,
				});
			};

			peerConnection.onicecandidate = (event) => {
				console.log(
					"[call] agent ice candidate",
					event.candidate?.candidate?.slice(0, 40),
				);
				if (!event.candidate) return;
				const { callId } = getStore();
				if (!callId) return;
				try {
					clientRef.current.emit(ClientCallEvents.ICE, {
						callId,
						to: peerId,
						candidate: {
							candidate: event.candidate.candidate,
							sdpMid: event.candidate.sdpMid,
							sdpMLineIndex: event.candidate.sdpMLineIndex,
						},
					});
				} catch {
					// Rate-limited or disconnected - the peer restarts ICE if needed.
				}
			};

			peerConnection.onconnectionstatechange = () => {
				console.log(
					`[call] pc ${peerId}: connection=${peerConnection.connectionState} ice=${peerConnection.iceConnectionState} signaling=${peerConnection.signalingState}`,
				);
				const store = getStore();
				const existing = store.peers[peerId];
				if (existing)
					store.upsertPeer({
						...existing,
						connection: peerConnection.connectionState,
					});
				if (peerConnection.connectionState === "failed") {
					void restartIce(peerId);
				} else if (peerConnection.connectionState === "disconnected") {
					// Transient blips recover alone - restart only if it persists.
					if (entry.disconnectTimer !== null)
						window.clearTimeout(entry.disconnectTimer);
					entry.disconnectTimer = window.setTimeout(() => {
						entry.disconnectTimer = null;
						if (peerConnection.connectionState === "disconnected")
							void restartIce(peerId);
					}, ICE_RESTART_DELAY_MS);
				} else if (peerConnection.connectionState === "connected") {
					entry.restartAttempts = 0;
					if (entry.disconnectTimer !== null) {
						window.clearTimeout(entry.disconnectTimer);
						entry.disconnectTimer = null;
					}
				}
			};

			return peerConnection;
		},
		[attachLocalTracks, cleanupPeer, restartIce],
	);

	const flushQueuedCandidates = useCallback(async (peerId: string) => {
		const entry = peerConnections.current.get(peerId);
		if (!entry) return;
		const queued = entry.pendingCandidates.splice(0);
		for (const c of queued) {
			try {
				await entry.peerConnection.addIceCandidate(c);
			} catch {
				// Stale candidate - safe to drop.
			}
		}
	}, []);

	/** Perfect-negotiation receive path: the polite side rolls back on collision. */
	const handleRemoteOffer = useCallback(
		async (peerId: string, sdp: SdpPayload) => {
			console.log("[call] handleRemoteOffer from", peerId);
			let entry = peerConnections.current.get(peerId);
			if (!entry) {
				createPeerConnection(peerId);
				entry = peerConnections.current.get(peerId);
				if (!entry) return;
			}
			const { peerConnection } = entry;
			// Deterministic politeness from peer ids (identity only, not auth).
			const polite = (selfPeerId.current ?? "") < peerId;
			const collision =
				entry.makingOffer || peerConnection.signalingState !== "stable";
			entry.ignoreOffer = !polite && collision;
			if (entry.ignoreOffer) return;
			try {
				if (collision)
					await peerConnection.setRemoteDescription({ type: "rollback" });
				await peerConnection.setRemoteDescription({
					type: "offer",
					sdp: sdp.sdp,
				});
				await flushQueuedCandidates(peerId);
				const answer = await peerConnection.createAnswer();
				await peerConnection.setLocalDescription(answer);
				console.log(
					"[call] agent setLocalDescription answer done, gathering=",
					peerConnection.iceGatheringState,
					"signaling=",
					peerConnection.signalingState,
				);
				window.setTimeout(() => {
					console.log(
						"[call] agent iceGatheringState later=",
						peerConnection.iceGatheringState,
					);
					if (peerConnection.iceGatheringState === "new") {
						console.log("[call] agent restarting ICE");
						try {
							peerConnection.restartIce();
						} catch (e) {
							console.log(e);
						}
					}
				}, 1000);
				const desc = peerConnection.localDescription;
				if (!desc) return;
				const { callId } = getStore();
				if (!callId) return;
				clientRef.current.emit(ClientCallEvents.ANSWER, {
					callId,
					to: peerId,
					sdp: { type: "answer", sdp: desc.sdp },
				});
			} catch (err) {
				console.log("[call] handleRemoteOffer error", err);
				// Glare resolved against us - the polite side's offer wins.
			}
		},
		[createPeerConnection, flushQueuedCandidates],
	);

	/**
	 * Returns the STUN/TURN config that lets two browsers behind NATs find
	 * each other and move media. Fetches it from the call server (TURN
	 * credentials are short-lived and server-managed) once per session and
	 * caches it in a ref for reuse. Call before creating the first
	 * RTCPeerConnection, e.g. before invite/accept.
	 */
	const ensureIceServers = useCallback(async (): Promise<RTCIceServer[]> => {
		if (iceServers.current) return iceServers.current;
		const res = await callApiService.getIceServers();
		const servers = (res.data.data.iceServers ?? []).map((s) => ({
			urls: s.urls,
			...(s.username ? { username: s.username } : {}),
			...(s.credential ? { credential: s.credential } : {}),
		}));
		iceServers.current = servers;
		return servers;
	}, []);

	/**
	 * Asks the browser for the local media the call needs: always the
	 * microphone, plus the camera only for "VIDEO" calls. Honors the
	 * previously selected devices (audioDeviceId/videoDeviceId) and applies
	 * the current mute state (localAudio/localVideo) to the new tracks.
	 * Saves the stream into the store and returns it, ready to attach to new
	 * peer connections.
	 * Rejects on browser errors (denied permission, no device found, ...) —
	 * map them with toMediaErrorMessage before showing to the user.
	 */
	const acquireLocalMedia = useCallback(
		async (type: CallType): Promise<MediaStream> => {
			const store = getStore();
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: store.audioDeviceId
					? {
							deviceId: { exact: store.audioDeviceId },
						}
					: true,
				video:
					type === "VIDEO"
						? store.videoDeviceId
							? { deviceId: { exact: store.videoDeviceId } }
							: true
						: false,
			});
			// Apply current mute state to fresh tracks.
			stream.getAudioTracks().forEach((t) => {
				t.enabled = store.localAudio;
			});
			stream.getVideoTracks().forEach((t) => {
				t.enabled = store.localVideo;
			});

			localStreamRef.current = stream;
			store.set({ localStream: stream });
			return stream;
		},
		[],
	);

	/**
	 * Start a new call.
	 */
	const startCall = useCallback(
		async (conversationId: string, type: CallType) => {
			console.log("[call] startCall clicked", { conversationId, type });
			const store = getStore();
			if (store.phase !== "idle") {
				console.log("[call] startCall blocked, phase:", store.phase);
				return;
			}
			let stream: MediaStream;

			try {
				stream = await acquireLocalMedia(type);
				console.log(
					"[call] local media acquired",
					stream.getTracks().map((t) => `${t.kind}:${t.readyState}`),
				);
			} catch (err) {
				console.log("[call] getUserMedia failed", err);
				store.set({ error: toMediaErrorMessage(err) });
				return;
			}

			try {
				await ensureIceServers();
			} catch {
				console.log("[call] ice-servers fetch failed");
				store.set({ error: "Could not reach the call server. Try again." });
				stream.getTracks().forEach((t) => {
					t.stop();
				});
				localStreamRef.current = null;
				store.set({ localStream: null });
				return;
			}
			store.set({
				phase: "outgoing",
				conversationId,
				type,
				error: null,
				localAudio: true,
				localVideo: type === "VIDEO",
			});
			ringtone.current.start();
			try {
				console.log(
					"[call] sending invite, socket connected:",
					clientRef.current.connected,
				);
				const ack = await clientRef.current.emitWithAck<{ callId: string }>(
					ClientCallEvents.INVITE,
					{ conversationId, type },
				);
				console.log("[call] invite ack", ack);
				getStore().set({
					callId: ack.callId,
					phase: "active",
					startedAt: Date.now(),
				});
				ringtone.current.stop();
			} catch (err) {
				ringtone.current.stop();
				fullCleanup();
				getStore().set({
					phase: "idle",
					error:
						err instanceof Error ? err.message : "Could not start the call.",
				});
			}
		},
		[acquireLocalMedia, ensureIceServers, fullCleanup],
	);

	const acceptCall = useCallback(async () => {
		const store = getStore();
		const incoming = store.incoming;
		if (!incoming || store.phase !== "incoming") return;
		let stream: MediaStream;
		try {
			stream = await acquireLocalMedia(incoming.type);
		} catch (err) {
			store.set({ error: toMediaErrorMessage(err) });
			return;
		}
		try {
			await ensureIceServers();
		} catch {
			store.set({ error: "Could not reach the call server. Try again." });
			stream.getTracks().forEach((t) => {
				t.stop();
			});
			localStreamRef.current = null;
			store.set({ localStream: null });
			return;
		}
		ringtone.current.stop();
		joiningRef.current = true;
		try {
			const ack = await clientRef.current.emitWithAck<CallPeersPayload>(
				ClientCallEvents.JOIN,
				{ callId: incoming.callId },
			);
			joiningRef.current = false;
			getStore().set({
				phase: "active",
				callId: incoming.callId,
				conversationId: incoming.conversationId,
				type: incoming.type,
				incoming: null,
				startedAt: Date.now(),
				localAudio: true,
				localVideo: incoming.type === "VIDEO",
			});
			// Offer direction: the newly joined peer offers to each existing peer.
			for (const peer of ack.peers) {
				createPeerConnection(peer.peerId);
				getStore().upsertPeer({
					peerId: peer.peerId,
					stream: null,
					audio: peer.audio,
					video: peer.video,
					connection: "new",
				});
				await sendOffer(peer.peerId);
			}
			sendMediaState(true, incoming.type === "VIDEO");
		} catch (err) {
			joiningRef.current = false;
			fullCleanup();
			getStore().set({
				phase: "idle",
				incoming: null,
				error: err instanceof Error ? err.message : "Could not join the call.",
			});
		}
	}, [
		acquireLocalMedia,
		createPeerConnection,
		ensureIceServers,
		fullCleanup,
		sendMediaState,
		sendOffer,
	]);

	const declineCall = useCallback(() => {
		const { incoming } = getStore();
		ringtone.current.stop();
		if (incoming && clientRef.current.connected) {
			try {
				clientRef.current.emit(ClientCallEvents.REJECT, {
					callId: incoming.callId,
				});
			} catch {
				// Best effort - the ring timeout ends the call server-side.
			}
		}
		getStore().reset();
	}, []);

	const hangUp = useCallback(() => {
		const store = getStore();
		const callId = store.callId ?? store.incoming?.callId ?? null;
		if (callId && clientRef.current.connected) {
			try {
				clientRef.current.emit(ClientCallEvents.LEAVE, { callId });
			} catch {
				// Best effort - presence TTLs clear the server state.
			}
		}
		endCallUi(null, false);
	}, [endCallUi]);

	const toggleAudio = useCallback(() => {
		const store = getStore();
		const next = !store.localAudio;
		store.localStream?.getAudioTracks().forEach((t) => {
			t.enabled = next;
		});
		store.set({ localAudio: next });
		sendMediaState(next, store.localVideo);
	}, [sendMediaState]);

	const toggleVideo = useCallback(() => {
		const store = getStore();
		const next = !store.localVideo;
		store.localStream?.getVideoTracks().forEach((t) => {
			t.enabled = next;
		});
		store.set({ localVideo: next });
		sendMediaState(store.localAudio, next);
	}, [sendMediaState]);

	const replaceVideoTrack = useCallback((newTrack: MediaStreamTrack | null) => {
		for (const [, entry] of peerConnections.current) {
			const sender = entry.peerConnection
				.getSenders()
				.find((s) => s.track?.kind === "video");
			if (sender) void sender.replaceTrack(newTrack);
		}
	}, []);

	const setAudioDevice = useCallback(async (deviceId: string) => {
		const store = getStore();
		store.set({ audioDeviceId: deviceId });
		if (!store.localStream) return;
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: { deviceId: { exact: deviceId } },
			});
			const [newTrack] = stream.getAudioTracks();
			if (!newTrack) return;
			newTrack.enabled = store.localAudio;
			for (const [, entry] of peerConnections.current) {
				const sender = entry.peerConnection
					.getSenders()
					.find((s) => s.track?.kind === "audio");
				if (sender) await sender.replaceTrack(newTrack);
			}
			store.localStream.getAudioTracks().forEach((t) => {
				t.stop();
			});
			const videoTracks = store.localStream.getVideoTracks();
			store.set({ localStream: new MediaStream([newTrack, ...videoTracks]) });
		} catch (err) {
			store.set({ error: toMediaErrorMessage(err) });
		}
	}, []);

	const setVideoDevice = useCallback(
		async (deviceId: string) => {
			const store = getStore();
			store.set({ videoDeviceId: deviceId });
			if (!store.localStream) return;
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { deviceId: { exact: deviceId } },
				});
				const [newTrack] = stream.getVideoTracks();
				if (!newTrack) return;
				newTrack.enabled = store.localVideo;
				replaceVideoTrack(newTrack);
				const oldVideo = store.localStream.getVideoTracks();
				oldVideo.forEach((t) => {
					t.stop();
				});
				const audioTracks = store.localStream.getAudioTracks();
				store.set({ localStream: new MediaStream([...audioTracks, newTrack]) });
			} catch (err) {
				store.set({ error: toMediaErrorMessage(err) });
			}
		},
		[replaceVideoTrack],
	);

	const startScreenShare = useCallback(async () => {
		const store = getStore();
		if (store.isSharingScreen) return;
		try {
			const display = await navigator.mediaDevices.getDisplayMedia({
				video: true,
			});
			const [track] = display.getVideoTracks();
			if (!track) return;
			replaceVideoTrack(track);
			store.set({ screenStream: display, isSharingScreen: true });
			// Restore the camera when the user stops sharing via browser UI.
			track.onended = () => {
				const camera = getStore().localStream?.getVideoTracks()[0] ?? null;
				replaceVideoTrack(camera);
				display.getTracks().forEach((t) => {
					t.stop();
				});
				getStore().set({ screenStream: null, isSharingScreen: false });
			};
		} catch (err) {
			if (err instanceof Error && err.name === "NotAllowedError") return;
			store.set({ error: toMediaErrorMessage(err) });
		}
	}, [replaceVideoTrack]);

	const stopScreenShare = useCallback(() => {
		const store = getStore();
		store.screenStream?.getTracks().forEach((t) => {
			t.stop();
		});
		const camera = store.localStream?.getVideoTracks()[0] ?? null;
		replaceVideoTrack(camera);
		store.set({ screenStream: null, isSharingScreen: false });
	}, [replaceVideoTrack]);

	const dismissEnded = useCallback(() => {
		getStore().set({ endedReason: null, error: null });
	}, []);

	// ─── Socket event wiring ──────────────────────────────────────────
	useEffect(() => {
		console.log("[call] socket status:", status);
		if (status !== "connected") return;
		const offs: Array<() => void> = [];
		const on = <T>(event: string, handler: (data: T) => void) => {
			offs.push(client.on<T>(event, handler));
		};

		on<CallIncomingPayload>(ServerCallEvents.INCOMING, (data) => {
			console.log("[call] incoming", data);
			const store = getStore();
			if (store.phase !== "idle") {
				// Busy in another call - tell the caller immediately.
				try {
					client.emit(ClientCallEvents.REJECT, { callId: data.callId });
				} catch {
					// Best effort.
				}
				return;
			}
			store.set({
				phase: "incoming",
				incoming: {
					callId: data.callId,
					from: data.from,
					type: data.type,
					conversationId: data.conversationId,
				},
			});
			ringtone.current.start();
		});

		on<{ callId: string }>(ServerCallEvents.HANDLED, (data) => {
			// Another of my devices handled the call - dismiss ringing here.
			const store = getStore();
			if (store.incoming?.callId === data.callId) {
				ringtone.current.stop();
				store.reset();
			}
		});

		on<CallPeerJoinedPayload>(ServerCallEvents.PEER_JOINED, (data) => {
			const store = getStore();
			if (store.callId !== data.callId || store.phase !== "active") return;
			if (data.peerId === selfPeerId.current) return;
			// Existing peers only answer - the newcomer offers (see acceptCall).
			createPeerConnection(data.peerId);
			if (!store.peers[data.peerId]) {
				store.upsertPeer({
					peerId: data.peerId,
					stream: null,
					audio: true,
					video: true,
					connection: "new",
				});
			}
		});

		on<CallPeerLeftPayload>(ServerCallEvents.PEER_LEFT, (data) => {
			if (getStore().callId !== data.callId) return;
			cleanupPeer(data.peerId);
		});

		on<{
			callId: string;
			reason: import("@package/call-signaling").CallEndReason;
		}>(ServerCallEvents.ENDED, (data) => {
			if (
				getStore().callId !== data.callId &&
				getStore().incoming?.callId !== data.callId
			)
				return;
			const conversationId = getStore().conversationId;
			endCallUi(data.reason, true);
			if (conversationId) {
				void queryClient.invalidateQueries({
					queryKey: ["calls", "history", conversationId],
				});
			}
		});

		on<{ callId: string }>(ServerCallEvents.BUSY, () => {
			ringtone.current.stop();
			fullCleanup();
			getStore().set({ phase: "idle", error: "The other person is busy." });
		});

		on<{ callId: string }>(ServerCallEvents.FULL, () => {
			ringtone.current.stop();
			fullCleanup();
			getStore().set({ phase: "idle", error: "The call is full." });
		});

		on<WebrtcOfferRelayPayload>(ServerCallEvents.OFFER, (data) => {
			if (getStore().callId !== data.callId) return;
			void handleRemoteOffer(data.from, data.sdp);
		});

		on<WebrtcAnswerRelayPayload>(ServerCallEvents.ANSWER, async (data) => {
			const store = getStore();
			if (store.callId !== data.callId) return;
			const entry = peerConnections.current.get(data.from);
			if (!entry) return;
			try {
				await entry.peerConnection.setRemoteDescription({
					type: "answer",
					sdp: data.sdp.sdp,
				});
				await flushQueuedCandidates(data.from);
			} catch {
				// Late/stale answer after a rollback - safe to ignore.
			}
		});

		on<WebrtcIceRelayPayload>(ServerCallEvents.ICE, async (data) => {
			const store = getStore();
			if (store.callId !== data.callId) return;
			const entry = peerConnections.current.get(data.from);
			if (!entry) return;
			const candidate: RTCIceCandidateInit = {
				candidate: data.candidate.candidate,
				sdpMid: data.candidate.sdpMid,
				sdpMLineIndex: data.candidate.sdpMLineIndex,
			};
			if (entry.peerConnection.remoteDescription) {
				try {
					await entry.peerConnection.addIceCandidate(candidate);
				} catch {
					// Stale candidate - safe to drop.
				}
			} else {
				// Remote description not set yet - queue and flush after it lands.
				entry.pendingCandidates.push(data.candidate);
			}
		});

		on<CallMediaStateRelayPayload>(ServerCallEvents.MEDIA_STATE, (data) => {
			const store = getStore();
			if (store.callId !== data.callId) return;
			const existing = store.peers[data.peerId];
			if (existing) {
				store.upsertPeer({ ...existing, audio: data.audio, video: data.video });
			}
		});

		// Server-side handler errors (busy/full/validation) arrive here, not
		// on the ack - fail a pending outgoing call or join with the message.
		on<{ message?: string }>("exception", (data) => {
			const store = getStore();
			if (store.phase === "outgoing" || joiningRef.current) {
				joiningRef.current = false;
				ringtone.current.stop();
				fullCleanup();
				store.set({
					phase: "idle",
					incoming: null,
					error: data?.message ?? "Could not start the call.",
				});
			}
		});

		return () => {
			offs.forEach((off) => {
				off();
			});
		};
	}, [
		client,
		status,
		cleanupPeer,
		createPeerConnection,
		endCallUi,
		flushQueuedCandidates,
		fullCleanup,
		handleRemoteOffer,
		queryClient,
	]);

	// Full cleanup on unmount.
	useEffect(() => {
		return () => fullCleanup();
	}, [fullCleanup]);

	const rejoinAfterReconnect = useCallback(async () => {
		const store = getStore();
		const callId = store.callId;
		if (!callId || store.phase !== "active") return;
		try {
			const ack = await clientRef.current.emitWithAck<CallPeersPayload>(
				ClientCallEvents.JOIN,
				{ callId },
			);
			// Fresh mesh: drop possibly-dead connections, re-offer to everyone.
			for (const id of [...peerConnections.current.keys()]) cleanupPeer(id);
			for (const peer of ack.peers) {
				createPeerConnection(peer.peerId);
				getStore().upsertPeer({
					peerId: peer.peerId,
					stream: null,
					audio: peer.audio,
					video: peer.video,
					connection: "new",
				});
				await sendOffer(peer.peerId);
			}
			sendMediaState(store.localAudio, store.localVideo);
		} catch {
			// The server ended the call meanwhile - its call:ended event lands next.
		}
	}, [cleanupPeer, createPeerConnection, sendMediaState, sendOffer]);

	// Rejoin mid-call sessions when the socket reconnects (the server keeps
	// the user joined through the ~20s grace period).
	const prevStatus = useRef(status);
	useEffect(() => {
		const was = prevStatus.current;
		prevStatus.current = status;
		if (was !== "connected" && status === "connected") {
			const store = getStore();
			if (store.callId && store.phase === "active") void rejoinAfterReconnect();
		}
	}, [status, rejoinAfterReconnect]);

	return useMemo(
		() => ({
			startCall,
			acceptCall,
			declineCall,
			hangUp,
			toggleAudio,
			toggleVideo,
			setAudioDevice,
			setVideoDevice,
			startScreenShare,
			stopScreenShare,
			dismissEnded,
		}),
		[
			startCall,
			acceptCall,
			declineCall,
			hangUp,
			toggleAudio,
			toggleVideo,
			setAudioDevice,
			setVideoDevice,
			startScreenShare,
			stopScreenShare,
			dismissEnded,
		],
	);
}
