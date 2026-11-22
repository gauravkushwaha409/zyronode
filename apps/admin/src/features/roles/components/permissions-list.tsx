import { Badge, Input, Typography } from "@package/ui";
import { useMemo, useState } from "react";
import { useAdminPermissionsQuery } from "../hooks/use-admin-roles";
import type { AdminPermission } from "../types";

const MODULE_LABELS: Record<string, string> = {
	inbox: "Inbox & Messaging",
	visitors: "Visitors & Live Tracking",
	analytics: "Analytics & Reporting",
	team: "Team & Workspace Management",
	settings: "System & Organization Settings",
};

export function PermissionsList() {
	const [search, setSearch] = useState("");
	const permissionsQuery = useAdminPermissionsQuery();

	const permissions = permissionsQuery.data?.data.data?.items ?? [];

	const filteredPermissions = useMemo(() => {
		const term = search.trim().toLowerCase();
		if (!term) return permissions;
		return permissions.filter(
			(p: AdminPermission) =>
				p.name.toLowerCase().includes(term) ||
				p.key.toLowerCase().includes(term) ||
				p.module.toLowerCase().includes(term) ||
				(p.description?.toLowerCase().includes(term) ?? false),
		);
	}, [permissions, search]);

	const groups = useMemo(() => {
		const map = new Map<string, AdminPermission[]>();
		for (const permission of filteredPermissions) {
			const group = map.get(permission.module) ?? [];
			group.push(permission);
			map.set(permission.module, group);
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [filteredPermissions]);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<Typography.T2 weight="semibold" className="text-gray-950">
						Global Permissions Registry
					</Typography.T2>
					<Typography.T4 className="text-gray-500">
						{permissions.length} system permissions grouped by functional modules
					</Typography.T4>
				</div>
				<Input
					leftIcon="main-search"
					placeholder="Search permissions or keys..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-72"
				/>
			</div>

			{permissionsQuery.isLoading ? (
				<div className="p-8 text-center text-gray-500">
					Loading permissions registry...
				</div>
			) : groups.length === 0 ? (
				<div className="rounded-xl border border-dashed border-gray-border-50 p-8 text-center">
					<Typography.T3 weight="semibold" className="text-gray-900">
						No permissions found
					</Typography.T3>
					<Typography.T5 className="mt-1 text-gray-500">
						No permissions matched your query &quot;{search}&quot;.
					</Typography.T5>
				</div>
			) : (
				<div className="space-y-6">
					{groups.map(([moduleName, modulePermissions]) => (
						<div
							key={moduleName}
							className="rounded-xl border border-gray-border-50 bg-white-base p-5 shadow-xs space-y-4"
						>
							<div className="flex items-center justify-between border-b border-gray-100 pb-3">
								<div className="flex items-center gap-2.5">
									<Typography.T2 weight="semibold" className="text-gray-900">
										{MODULE_LABELS[moduleName] || `${moduleName.toUpperCase()} Module`}
									</Typography.T2>
									<Badge size="xs" variant="secondary">
										{modulePermissions.length} permissions
									</Badge>
								</div>
								<span className="text-xs font-mono text-gray-400">
									module: {moduleName}
								</span>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
								{modulePermissions.map((permission) => (
									<div
										key={permission.id}
										className="flex flex-col justify-between rounded-lg border border-gray-100 bg-gray-fill-25 p-3.5 space-y-2 hover:border-gray-300 transition-colors"
									>
										<div>
											<div className="flex items-start justify-between gap-1">
												<Typography.T3 weight="semibold" className="text-gray-900 truncate">
													{permission.name}
												</Typography.T3>
											</div>
											<code className="text-[11px] font-mono text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded mt-1 inline-block">
												{permission.key}
											</code>
											{permission.description && (
												<Typography.T5 className="text-gray-600 mt-1.5 text-xs line-clamp-2">
													{permission.description}
												</Typography.T5>
											)}
										</div>

										<div className="pt-2 border-t border-gray-100/80">
											<span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
												Assigned Roles ({permission.roles?.length ?? 0}):
											</span>
											<div className="flex flex-wrap gap-1">
												{permission.roles && permission.roles.length > 0 ? (
													permission.roles.map((r) => (
														<Badge
															key={r.id}
															size="xs"
															variant={r.isSystem ? "secondary" : "success"}
														>
															{r.name}
														</Badge>
													))
												) : (
													<span className="text-[11px] text-gray-400 italic">
														None assigned
													</span>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
