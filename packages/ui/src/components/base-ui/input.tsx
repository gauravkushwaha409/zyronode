import * as React from "react";
import { cn } from "#lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"flex h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3.5 py-2 text-base shadow-sm transition-all outline-none",
				"file:inline-flex file:h-7 file:items-center file:rounded-md file:border-0 file:bg-primary/10 file:px-2.5 file:text-sm file:font-medium file:text-primary file:transition-colors hover:file:bg-primary/15",
				"placeholder:text-muted-foreground",
				"focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20",
				"disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
				"aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
				"md:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
