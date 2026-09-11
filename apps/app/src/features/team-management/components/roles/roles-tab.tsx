import type { ColumnDef } from "@package/ui";
import {
	Badge,
	Button,
	ConfirmationDialog,
	cn,
	SectionHeader,
	Typography,
	toast,
} from "@package/ui";
import { useState } from "react";
import { Table } from "@/components";
import {
	useCreateRoleMutation,
	useDeleteRoleMutation,
	usePermissionsQuery,
	useRolesQuery,
	useUpdateRoleMutation,
} from "../../hooks";
import type { RoleForm, RoleItem } from "../../types";
import { RoleFormDialog } from "./role-form-dialog";

interface RolesTabProps {
	organizationId: string;
}

interface DialogState {
	mode: RoleForm.Mode;
	role?: RoleItem;
}

export function RolesTab({ organizationId }: RolesTabProps) {
	const rolesQuery = useRolesQuery(organizationId);
	const permissionsQuery = usePermissionsQuery(organizationId);

	const [dialog, setDialog] = useState<DialogState | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);

	const createMutation = useCreateRoleMutation(organizationId);
	const updateTarget = dialog?.mode === "edit" ? dialog.role : undefined;
	const updateMutation = useUpdateRoleMutation(
		organizationId,
		updateTarget?.id ?? "",
	);
	const deleteMutation = useDeleteRoleMutation(
		organizationId,
		deleteTarget?.id ?? "",
	);

	const roles = rolesQuery.data?.data.data ?? [];
	const permissions = permissionsQuery.data?.data.data ?? [];

	const columns: ColumnDef<RoleItem>[] = [
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
									? "bg-gray-100 text-gray-600"
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
								{role.description ?? "No description"}
							</Typography.T6>
						</div>
					</div>
				);
			},
		},
		{
			id: "permissions",
			header: "Permissions",
			size: 130,
			cell: ({ row }) => (
				<Badge size="xs" variant="info">
					{row.original.permissions.length} permissions
				</Badge>
			),
		},
		{
			id: "members",
			header: "Members",
			size: 120,
			cell: ({ row }) => (
				<Typography.T4 className="text-gray-700">
					{row.original.membersCount}
				</Typography.T4>
			),
		},
		{
			id: "type",
			header: "Type",
			size: 120,
			cell: ({ row }) => {
				const role = row.original;
				return (
					<Badge
						radius="rounded"
						size="xs"
						dot
						variant={role.isSystem ? "secondary" : "success"}
					>
						{role.isSystem ? "System" : "Custom"}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			header: "",
			size: 210,
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
						{!role.isSystem && (
							<>
								<Button
									size="xs"
									variant="gray"
									onClick={() => setDialog({ mode: "edit", role })}
								>
									Edit
								</Button>
								<Button size="xs" variant="alert" onClick={() => setDeleteTarget(role)}>
									Delete
								</Button>
							</>
						)}
					</div>
				);
			},
		},
	];

	const handleSubmit = (payload: RoleForm.Payload) => {
		if (!dialog) return;

		if (dialog.mode === "create") {
			createMutation.mutate(payload, {
				onSuccess: () => {
					toast.success("Role created");
					setDialog(null);
				},
				onError: () => toast.error("Could not create role"),
			});
			return;
		}

		updateMutation.mutate(payload, {
			onSuccess: () => {
				toast.success("Role updated");
				setDialog(null);
			},
			onError: () => toast.error("Could not update role"),
		});
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Role deleted");
				setDeleteTarget(null);
			},
			onError: () => toast.error("Could not delete role"),
		});
	};

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	return (
		<section className="space-y-4">
			<SectionHeader
				heading="Roles"
				description="Access levels and permissions. System roles are fixed; create custom roles for your team."
				actions={
					<Button
						size="sm"
						className="w-fit"
						onClick={() => setDialog({ mode: "create" })}
					>
						Create Role
					</Button>
				}
			/>

			<Table
				data={roles}
				columns={columns}
				getRowId={(role) => role.id}
				isPending={rolesQuery.isLoading}
				isError={rolesQuery.isError}
				emptyState={
					<Typography.T4 className="text-gray-500">
						No roles yet. Create a custom role to grant your team specific access.
					</Typography.T4>
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
					onSubmit={handleSubmit}
				/>
			)}

			<ConfirmationDialog
				open={Boolean(deleteTarget)}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				title="Delete role"
				description="This action cannot be undone."
				paragraph={`Delete the "${deleteTarget?.name}" role? Members assigned this role will keep the role removed from their profiles.`}
				confirmLabel="Delete role"
				variant="alert"
				isPending={deleteMutation.isPending}
				pendingText="Deleting..."
				onConfirm={handleDelete}
			/>
		</section>
	);
}
