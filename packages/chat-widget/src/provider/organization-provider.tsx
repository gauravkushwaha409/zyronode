import { createContext, type ReactNode, useContext } from "react";
import { getConfig } from "../config";

const OrganizationIdContext = createContext<string | null>(null);

interface OrganizationProviderProps {
	/** Explicit override (e.g. multi-tenant hosts); falls back to configured value. */
	organizationId?: string;
	children: ReactNode;
}

/**
 * Single source of the organization id for the whole widget tree.
 * Resolves prop -> configureChatWidget() value -> null (providers stay
 * dormant without an org rather than calling with undefined).
 */
export function OrganizationProvider({
	organizationId,
	children,
}: OrganizationProviderProps) {
	let resolved: string | null = organizationId ?? null;
	if (!resolved) {
		try {
			resolved = getConfig().organizationId ?? null;
		} catch {
			resolved = null;
		}
	}
	return (
		<OrganizationIdContext.Provider value={resolved}>
			{children}
		</OrganizationIdContext.Provider>
	);
}

/** Organization id for the widget tree, or null when not configured yet. */
export function useOrganizationId(): string | null {
	return useContext(OrganizationIdContext);
}
