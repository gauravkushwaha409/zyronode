import { cn, Typography } from "@package/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PermissionsList } from "@/features/roles/components/permissions-list";
import { RolesList } from "@/features/roles/components/roles-list";

export const Route = createFileRoute("/_shell/roles-and-permissions")({
	component: RolesAndPermissionsPage,
});

type RolesAndPermissionsTab = "roles" | "permissions" | "platform";

const TABS: { id: RolesAndPermissionsTab; label: string }[] = [
	{ id: "roles", label: "Organization Roles" },
	{ id: "permissions", label: "Permissions Registry" },
	{ id: "platform", label: "Platform Roles" },
];

function RolesAndPermissionsPage() {
	const [activeTab, setActiveTab] = useState<RolesAndPermissionsTab>("roles");

	return (
		<div className="flex h-full flex-col">
			<div className="flex flex-col gap-4 border-b border-gray-border-50 px-6 py-4">
				<div>
					<Typography.T1 weight="semibold" className="text-gray-950">
						Role and Permission
					</Typography.T1>
					<Typography.T3 className="text-gray-500">
						Manage platform system roles, custom organization roles, and security
						permissions.
					</Typography.T3>
				</div>

				<div className="flex items-center gap-1 border-b border-gray-100 pb-px">
					{TABS.map((tab) => {
						const isSelected = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer",
									isSelected
										? "bg-primary-50 text-primary-900 border-b-2 border-primary-600"
										: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
								)}
							>
								{tab.label}
							</button>
						);
					})}
				</div>
			</div>

			<div className="flex-1 overflow-auto p-6">
				{activeTab === "roles" && (
					<RolesList scope="ORGANIZATION" readOnly />
				)}
				{activeTab === "permissions" && <PermissionsList />}
				{activeTab === "platform" && <RolesList scope="PLATFORM" />}
			</div>
		</div>
	);
}
