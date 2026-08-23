import { createQueryClient, TanstackQueryProvider } from "@package/query";
import type { ReactNode } from "react";

const queryClient = createQueryClient();

export function WidgetQueryProvider({ children }: { children: ReactNode }) {
	return (
		<TanstackQueryProvider client={queryClient}>
			{children}
		</TanstackQueryProvider>
	);
}
