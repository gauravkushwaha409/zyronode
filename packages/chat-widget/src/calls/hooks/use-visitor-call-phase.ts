import { useVisitorCallStore } from "../store/use-visitor-call.store";

/** Current call phase for gating call buttons. */
export function useVisitorCallPhase() {
	return useVisitorCallStore((s) => s.phase);
}
