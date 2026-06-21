import { useState } from "react";
import { Button, DialogWrapper } from "@package/ui";
import { useRouter } from "@tanstack/react-router";
import { useLogoutMutation } from "@/features/auth/hooks";
import {
	OrganizationList,
	OrganizationMutation,
} from "@/features/organization/components";

export function SelectOrganizationPage() {
	const router = useRouter();
	const [showCreate, setShowCreate] = useState(false);
	const logoutMutation = useLogoutMutation();

	const handleLogout = () => {
		logoutMutation.mutate(undefined, {
			onSuccess: () => {
router.navigate({ to: "/auth/login" });
		},
	});
	};

	return (
		<div className="flex min-h-dvh items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
			<div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-3 duration-500">
				<div className="text-center mb-8">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
						<svg
							className="size-7 text-white"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
						>
							<title>Organization</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
						Select Organization
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
						Choose an organization to continue, or create a new one.
					</p>
				</div>

				<div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-8 border border-white/50 dark:border-zinc-800/50 shadow-xl shadow-black/5 dark:shadow-black/20">
					<OrganizationList />

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase tracking-widest">
							<span className="bg-card px-3 text-muted-foreground/60">
								or
							</span>
						</div>
					</div>

					<button
						type="button"
						onClick={() => setShowCreate(true)}
						className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
					>
						<svg
							className="size-4"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
						>
							<title>Create</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 4.5v15m7.5-7.5h-15"
							/>
						</svg>
						Create new organization
					</button>
				</div>

				<div className="mt-6 flex items-center justify-center gap-4">
					<Button
						variant="destructive"
						size="sm"
						onClick={handleLogout}
						disabled={logoutMutation.isPending}
					>
						{logoutMutation.isPending ? "Logging out..." : "Logout"}
					</Button>

					<span className="text-xs text-muted-foreground">or</span>

					<button
						type="button"
						onClick={() => router.navigate({ to: "/auth/login" })}
						className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline underline-offset-2 transition-colors"
					>
						Back to login
					</button>
				</div>

				<DialogWrapper
					title="Create Organization"
					open={showCreate}
					onOpenChange={setShowCreate}
				>
					<OrganizationMutation onSuccess={() => setShowCreate(false)} />
				</DialogWrapper>
			</div>
		</div>
	);
}
