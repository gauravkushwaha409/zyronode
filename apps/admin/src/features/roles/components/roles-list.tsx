import {
	Badge,
	Button,
	type ColumnDef,
	ConfirmationDialog,
	cn,
	Input,
	Table,
	Typography,
	toast,
} from "@package/ui";
import { useEffect, useState } from "react";
import {
	useAdminPermissionsQuery,
	useAdminRolesQuery,
	useCreateAdminRoleMutation,
	useDeleteAdminRoleMutation,
	useUpdateAdminRoleMutation,
} from "../hooks/use-admin-roles";
import type { AdminRole } from "../types";
import { type RoleDialogMode, RoleFormDialog } from "./role-form-dialog";

interface RolesListProps {
	scope?: "PLATFORM" | "ORGANIZATION";
	readOnly?: boolean;
}

export function RolesList({ scope, readOnly = false }: RolesListProps) {
	const [typeFilter, setTypeFilter] = useState<"all" | "system" | "custom">(
		"all",
	);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const [dialog, setDialog] = useState<{
		mode: RoleDialogMode;
		role?: AdminRole | null;
	} | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AdminRole | null>(null);

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
		return () => clearTimeout(timeout);
	}, [search]);

	const rolesQuery = useAdminRolesQuery({
		scope,
		type: typeFilter,
		search: debouncedSearch || undefined,
	});

	const permissionsQuery = useAdminPermissionsQuery();

	const createMutation = useCreateAdminRoleMutation();
	const updateTarget = dialog?.mode === "edit" ? dialog.role : undefined;
	const updateMutation = useUpdateAdminRoleMutation(updateTarget?.id ?? "");
	const deleteMutation = useDeleteAdminRoleMutation(deleteTarget?.id ?? "");

	const roles = rolesQuery.data?.data.data?.items ?? [];
	const permissions = permissionsQuery.data?.data.data?.items ?? [];

	const columns: ColumnDef<AdminRole>[] = [
		{
			id: "role",
			header: "Role Name",
			size: 260,
			cell: ({ row }) => {
				const role = row.original;
				return (
					<div className="flex min-w-0 items-center gap-3">
						<span
							className={cn(
								"flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold capitalize",
								role.isSystem
									? "bg-gray-100 text-gray-700"
									: "bg-primary-50 text-primary-600",
							)}
						>
							{role.name.charAt(0)}
						</span>
						<div className="flex min-w-0 flex-col">
							<Typography.T3
								weight="semibold"
								className="truncate text-gray-950 capitalize"
							>
								{role.name}
							</Typography.T3>
							<Typography.T6 className="truncate text-gray-500">
								{role.description ?? "No description provided"}
							</Typography.T6>
						</div>
					</div>
				);
			},
		},
		{
			id: "type",
			header: "Type",
			size: 110,
			cell: ({ row }) => (
				<Badge variant={row.original.isSystem ? "secondary" : "success"} size="sm">
					{row.original.isSystem ? "System" : "Custom"}
				</Badge>
			),
		},
		{
			id: "scope",
			header: "Scope",
			size: 170,
			cell: ({ row }) => {
				const role = row.original;
				if (role.isSystem) {
					return (
						<Badge variant="info" size="xs">
							Global System
						</Badge>
					);
				}
				return (
					<span className="truncate text-xs font-medium text-gray-700">
						{role.organization?.name ?? "Custom Org"}
					</span>
				);
			},
		},
		{
			id: "permissions",
			header: "Permissions",
			size: 140,
			cell: ({ row }) => (
				<Badge size="xs" variant="secondary">
					{row.original.permissions?.length ?? 0} permissions
				</Badge>
			),
		},
		{
			id: "members",
			header: "Members",
			size: 100,
			cell: ({ row }) => (
				<span className="text-sm font-medium text-gray-700">
					{row.original.membersCount}
				</span>
			),
		},
		{
			id: "actions",
			header: "",
			size: 200,
			cell: ({ row }) => {
				const role = row.original;
				return (
					<div className="flex items-center justify-end gap-1.5">
						<Button
							size="xs"
							variant="outline"
							onClick={() => setDialog({ mode: "view", role })}
						>
							View
						</Button>
						{!readOnly && !role.isSystem && (
							<Button
								size="xs"
								variant="gray"
								onClick={() => setDialog({ mode: "edit", role })}
							>
								Edit
							</Button>
						)}
						{!readOnly && !role.isSystem && (
							<Button size="xs" variant="alert" onClick={() => setDeleteTarget(role)}>
								Delete
							</Button>
						)}
					</div>
				);
			},
		},
	];

	const handleFormSubmit = (payload: {
		name: string;
		description?: string;
		permissionIds: string[];
	}) => {
		if (!dialog) return;

		if (dialog.mode === "create") {
			createMutation.mutate(payload, {
				onSuccess: () => {
					toast.success("Role created successfully");
					setDialog(null);
				},
				onError: (err) => {
					toast.error(err.response?.data?.error || "Failed to create role");
				},
			});
			return;
		}

		if (dialog.mode === "edit" && dialog.role) {
			updateMutation.mutate(payload, {
				onSuccess: () => {
					toast.success("Role updated successfully");
					setDialog(null);
				},
				onError: (err) => {
					toast.error(err.response?.data?.error || "Failed to update role");
				},
			});
		}
	};

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		deleteMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Role deleted successfully");
				setDeleteTarget(null);
			},
			onError: (err) => {
				toast.error(err.response?.data?.error || "Failed to delete role");
			},
		});
	};

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={() => setTypeFilter("all")}
						className={cn(
							"px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
							typeFilter === "all"
								? "bg-gray-900 text-white"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200",
						)}
					>
						All Roles ({roles.length})
					</button>
					<button
						type="button"
						onClick={() => setTypeFilter("system")}
						className={cn(
							"px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
							typeFilter === "system"
								? "bg-gray-900 text-white"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200",
						)}
					>
						System Roles
					</button>
					<button
						type="button"
						onClick={() => setTypeFilter("custom")}
						className={cn(
							"px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
							typeFilter === "custom"
								? "bg-gray-900 text-white"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200",
						)}
					>
						Custom Roles
					</button>
				</div>

				<div className="flex items-center gap-2">
					<Input
						leftIcon="main-search"
						placeholder="Search roles..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-64"
					/>
					{!readOnly && (
						<Button
							size="sm"
							onClick={() => setDialog({ mode: "create" })}
							className="shrink-0"
						>
							Create Platform Role
						</Button>
					)}
				</div>
			</div>

			<Table
				data={roles}
				columns={columns}
				getRowId={(role) => role.id}
				isPending={rolesQuery.isLoading}
				isError={rolesQuery.isError}
				emptyState={
					<div className="flex flex-col items-center justify-center p-8 text-center">
						<Typography.T3 weight="semibold" className="text-gray-900">
							No roles found
						</Typography.T3>
						<Typography.T5 className="mt-1 text-gray-500 max-w-sm">
							{search
								? `No roles matched "${search}". Try adjusting your search term.`
								: "No roles registered in this category."}
						</Typography.T5>
					</div>
				}
			/>

			{dialog && (
				<RoleFormDialog
					open
					mode={dialog.mode}
					role={dialog.role}
					permissions={permissions}
					isSubmitting={isSubmitting}
					onOpenChange={(open) => {
						if (!open) setDialog(null);
					}}
					onSubmit={handleFormSubmit}
				/>
			)}

			<ConfirmationDialog
				open={Boolean(deleteTarget)}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				title="Delete Custom Role"
				description="This action cannot be undone."
				paragraph={`Are you sure you want to delete the "${deleteTarget?.name}" role?`}
				confirmLabel="Delete Role"
				variant="alert"
				isPending={deleteMutation.isPending}
				pendingText="Deleting..."
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	);
}
