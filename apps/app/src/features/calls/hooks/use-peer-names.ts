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

/** Maps call peer userIds to org member display names (falls back to Peer N). */
export function usePeerNames(peerIds: string[]): Record<string, string> {
	const organizationId = useCallStore((s) => s.organizationId);
	const { data } = useOrganizationMembersQuery(organizationId ?? "");
	const members = data?.data.data ?? [];

	return useMemo(() => {
		const names: Record<string, string> = {};
		peerIds.forEach((id, i) => {
			const member = members.find((m) => m.user.id === id);
			names[id] = displayName(member?.user, `Peer ${i + 1}`);
		});
		return names;
	}, [members, peerIds]);
}
