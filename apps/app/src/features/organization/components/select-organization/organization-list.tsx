import { useRouter } from "@tanstack/react-router";
import { useMyOrganizationsQuery } from "../../hooks";
import type { OrganizationList as OrgListTypes } from "../../types";

function OrganizationCard({
	org,
	onSelect,
}: {
	org: OrgListTypes.OrganizationItem;
	onSelect: (id: string) => void;
}) {
	const member = org.members?.[0];
	const initial = org.name.charAt(0).toUpperCase();

	return (
		<button
			type="button"
			onClick={() => onSelect(org.id)}
			className="group relative flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
		>
			<div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary transition-colors group-hover:bg-primary/15">
				{initial}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-foreground">
					{org.name}
				</p>
				<p className="truncate text-xs text-muted-foreground">{org.email}</p>
				{member?.joinedAt && (
					<p className="mt-0.5 text-[11px] text-muted-foreground/60">
						Joined {new Date(member.joinedAt).toLocaleDateString()}
					</p>
				)}
			</div>

			<div className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary">
				<svg
					className="size-5"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<title>Select</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
					/>
				</svg>
			</div>
		</button>
	);
}

export function OrganizationList() {
	const router = useRouter();
	const { data, isLoading, isError, error } = useMyOrganizationsQuery();

	const handleSelect = (id: string) => {
		router.navigate({
			to: "/$organization/dashboard",
			params: { organization: id },
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 animate-pulse"
					>
						<div className="size-12 rounded-xl bg-muted" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-3/5 rounded bg-muted" />
							<div className="h-3 w-2/5 rounded bg-muted" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (isError) {
		const message =
			(error as any)?.response?.data?.message || "Failed to load organizations";
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
				<svg
					className="mb-3 size-10 text-destructive/60"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<title>Error</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
					/>
				</svg>
				<p className="text-sm font-medium text-destructive">{message}</p>
			</div>
		);
	}

	const organizations = data?.data?.data ?? [];

	if (!organizations.length) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-border px-6 py-14 text-center">
				<div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
					<svg
						className="size-7 text-muted-foreground"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<title>Empty</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
						/>
					</svg>
				</div>
				<p className="text-sm font-medium text-foreground">
					No organizations yet
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					Create your first organization to get started.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{organizations.map((org) => (
				<OrganizationCard
					key={org.id}
					org={org}
					onSelect={handleSelect}
				/>
			))}
		</div>
	);
}
