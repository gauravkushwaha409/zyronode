import { useQueryClient } from "@package/query";
import { useChannel, useEvent, WebSocketProvider } from "@package/websocket";
import { useCallback } from "react";
import { getSocketUrl } from "@/config/socket";

interface LeadSocketProviderProps {
	organizationId: string;
	children: React.ReactNode;
}

function LeadSocketEvents({ organizationId }: { organizationId: string }) {
	const queryClient = useQueryClient();
	useChannel("agent:join", { organizationId });

	useEvent("lead:created", useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["lead", organizationId] });
	}, [queryClient, organizationId]));
	useEvent("lead:updated", useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["lead", organizationId] });
	}, [queryClient, organizationId]));

	return null;
}

export function LeadSocketProvider({
	organizationId,
	children,
}: LeadSocketProviderProps) {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;
	return (
		<WebSocketProvider
			options={{
				url: getSocketUrl(),
				transports: ["websocket"],
				reconnection: true,
				reconnectionAttempts: 10,
				reconnectionDelay: 1000,
				withCredentials: true,
			}}
			auth={{ token }}
		>
			<LeadSocketEvents organizationId={organizationId} />
			{children}
		</WebSocketProvider>
	);
}
