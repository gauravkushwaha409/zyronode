import { parsePeerId } from "@package/call-signaling";
import { useMemo } from "react";
import { useOrganizationMembersQuery } from "@/features/organization/hooks/query/use-organization-members.query";
import { useCallStore } from "../store/use-call.store";

function displayName(
	user:
		| { firstName: string | null; lastName: string | null; email: string }
		| undefined,
	fallback: string,
): string {
	if (!user) return fallback;
	const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
	return full || user.email || fallback;
}

/** Maps call peer ids to display names (agents via members, else fallback). */
export function usePeerNames(peerIds: string[]): Record<string, string> {
	const organizationId = useCallStore((s) => s.organizationId);
	const { data } = useOrganizationMembersQuery(organizationId ?? "");
	const members = data?.data.data ?? [];

	return useMemo(() => {
		const names: Record<string, string> = {};
		peerIds.forEach((peerId, i) => {
			const parsed = parsePeerId(peerId);
			if (parsed?.kind === "user") {
				const member = members.find((m) => m.user.id === parsed.id);
				names[peerId] = displayName(member?.user, `Peer ${i + 1}`);
			} else {
				names[peerId] = "Visitor";
			}
		});
		return names;
	}, [members, peerIds]);
}
