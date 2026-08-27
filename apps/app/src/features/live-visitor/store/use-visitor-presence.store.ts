import { create } from "zustand";
import type { VisitorPresenceEvent } from "../types";

interface PresencePatch {
	isOnline: boolean;
	currentPage?: string;
	activeDuration?: number;
	at: string;
}

interface VisitorPresenceState {
	/** visitorId -> latest ephemeral presence tick */
	presence: Record<string, PresencePatch>;
	applyPresence: (event: VisitorPresenceEvent) => void;
	reset: () => void;
}

/**
 * Holds WebSocket presence ticks, which are deliberately NOT persisted
 * server-side. Kept out of the react-query cache so that cache only ever
 * contains server truth; components merge this over the fetched rows.
 */
export const useVisitorPresenceStore = create<VisitorPresenceState>((set) => ({
	presence: {},
	applyPresence: (event) =>
		set((state) => {
			const existing = state.presence[event.visitorId];
			// ignore out-of-order ticks
			if (existing && existing.at > event.at) return state;

			return {
				presence: {
					...state.presence,
					[event.visitorId]: {
						isOnline: event.isOnline,
						currentPage: event.currentPage ?? existing?.currentPage,
						activeDuration: event.activeDuration ?? existing?.activeDuration,
						at: event.at,
					},
				},
			};
		}),
	reset: () => set({ presence: {} }),
}));
