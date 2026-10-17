import type { CallEndReason, CallType } from "@package/call-signaling";
import { create } from "zustand";

export type VisitorCallPhase = "idle" | "outgoing" | "incoming" | "active";

export interface VisitorRemotePeer {
	peerId: string;
	stream: MediaStream | null;
	audio: boolean;
	video: boolean;
	connection: RTCPeerConnectionState;
}

export interface VisitorIncomingCall {
	callId: string;
	from: string;
	type: CallType;
	conversationId: string;
}

interface VisitorCallStore {
	phase: VisitorCallPhase;
	callId: string | null;
	conversationId: string | null;
	type: CallType;
	incoming: VisitorIncomingCall | null;
	endedReason: CallEndReason | null;
	error: string | null;

	localStream: MediaStream | null;
	localAudio: boolean;
	localVideo: boolean;

	peers: Record<string, VisitorRemotePeer>;
	startedAt: number | null;

	/** Org scope for ICE/token endpoints (set by the call provider). */
	organizationId: string | null;

	set: (partial: Partial<VisitorCallStore>) => void;
	upsertPeer: (peer: VisitorRemotePeer) => void;
	removePeer: (peerId: string) => void;
	reset: () => void;
}

const initial = {
	phase: "idle",
	callId: null,
	conversationId: null,
	type: "AUDIO",
	incoming: null,
	endedReason: null,
	error: null,
	localStream: null,
	localAudio: true,
	localVideo: true,
	peers: {},
	startedAt: null,
	organizationId: null,
} as const;

export const useVisitorCallStore = create<VisitorCallStore>()((set) => ({
	...initial,
	set: (partial) => set(partial),
	upsertPeer: (peer) =>
		set((state) => ({ peers: { ...state.peers, [peer.peerId]: peer } })),
	removePeer: (peerId) =>
		set((state) => {
			const peers = { ...state.peers };
			delete peers[peerId];
			return { peers };
		}),
	reset: () => set({ ...initial }),
}));
