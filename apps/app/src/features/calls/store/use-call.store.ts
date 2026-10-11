import type { CallEndReason, CallType } from "@package/call-signaling";
import { create } from "zustand";

export type CallPhase = "idle" | "outgoing" | "incoming" | "active";

export interface RemotePeerState {
	userId: string;
	stream: MediaStream | null;
	audio: boolean;
	video: boolean;
	connection: RTCPeerConnectionState;
}

interface IncomingCall {
	callId: string;
	from: string;
	type: CallType;
	conversationId: string;
}

interface CallStore {
	phase: CallPhase;
	callId: string | null;
	conversationId: string | null;
	type: CallType;
	incoming: IncomingCall | null;
	endedReason: CallEndReason | null;
	error: string | null;

	localStream: MediaStream | null;
	screenStream: MediaStream | null;
	localAudio: boolean;
	localVideo: boolean;
	isSharingScreen: boolean;

	peers: Record<string, RemotePeerState>;
	startedAt: number | null;

	audioDeviceId: string | null;
	videoDeviceId: string | null;

	/** Org scope for resolving peer display names (set by CallProvider). */
	organizationId: string | null;

	set: (partial: Partial<CallStore>) => void;
	upsertPeer: (peer: RemotePeerState) => void;
	removePeer: (userId: string) => void;
	reset: () => void;
}

const initial: Pick<
	CallStore,
	| "phase"
	| "callId"
	| "conversationId"
	| "type"
	| "incoming"
	| "endedReason"
	| "error"
	| "localStream"
	| "screenStream"
	| "localAudio"
	| "localVideo"
	| "isSharingScreen"
	| "peers"
	| "startedAt"
> = {
	phase: "idle",
	callId: null,
	conversationId: null,
	type: "AUDIO",
	incoming: null,
	endedReason: null,
	error: null,
	localStream: null,
	screenStream: null,
	localAudio: true,
	localVideo: true,
	isSharingScreen: false,
	peers: {},
	startedAt: null,
};

export const useCallStore = create<CallStore>()((set) => ({
	...initial,
	audioDeviceId: null,
	videoDeviceId: null,
	organizationId: null,

	set: (partial) => set(partial),
	upsertPeer: (peer) =>
		set((state) => ({ peers: { ...state.peers, [peer.userId]: peer } })),
	removePeer: (userId) =>
		set((state) => {
			const peers = { ...state.peers };
			delete peers[userId];
			return { peers };
		}),
	reset: () => set({ ...initial }),
}));
