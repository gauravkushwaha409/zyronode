import type { VisitorListItem } from "../types";

/** "2h 15m" / "3m 20s" / "45s" */
export function formatDuration(seconds: number | null | undefined): string {
	if (!seconds || seconds < 0) return "0s";

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0) return `${hours}h ${minutes}m`;
	if (minutes > 0) return `${minutes}m ${secs}s`;
	return `${secs}s`;
}

export function visitorDisplayName(
	visitor: Pick<VisitorListItem, "name" | "email" | "ipAddress">,
): string {
	return visitor.name || visitor.email || visitor.ipAddress || "Anonymous";
}

export function visitorInitial(
	visitor: Pick<VisitorListItem, "name" | "email" | "ipAddress">,
): string {
	const source = visitor.name || visitor.email;
	return source ? source.trim().charAt(0).toUpperCase() : "?";
}

export function visitorLocation(
	visitor: Pick<VisitorListItem, "city" | "country">,
): string {
	return [visitor.city, visitor.country].filter(Boolean).join(", ") || "Unknown";
}
