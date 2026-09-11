import {
	Badge,
	Button,
	ConfirmationDialog,
	EmptyState,
	SectionHeader,
	Typography,
	toast,
} from "@package/ui";
import { useState } from "react";
import {
	useCreateRoleMutation,
	useDeleteRoleMutation,
	usePermissionsQuery,
	useRolesQuery,
	useUpdateRoleMutation,
} from "../../hooks";
import type { RoleItem } from "../../types";
import {
	RoleFormDialog,
	type RoleFormMode,
	type RoleFormPayload,
} from "./role-form-dialog";

interface RolesTabProps {
	organizationId: string;
}

interface DialogState {
	mode: RoleFormMode;
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

	const handleSubmit = (payload: RoleFormPayload) => {
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

			{rolesQuery.isLoading ? (
				<EmptyState title="Loading roles…" size="sm" />
			) : rolesQuery.isError ? (
				<EmptyState
					title="Failed to load roles"
					description="The server could not be reached. Try again."
					action={
						<Button variant="outline" size="xs" onClick={() => rolesQuery.refetch()}>
							Retry
						</Button>
					}
					size="sm"
				/>
			) : roles.length === 0 ? (
				<EmptyState
					title="No roles yet"
					description="Create a custom role to grant your team specific access."
					size="sm"
				/>
			) : (
				<div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
					<table className="w-full text-sm">
						<thead className="bg-gray-50 text-gray-500">
							<tr>
								<th className="text-left font-medium px-4 py-2.5">Role Name</th>
								<th className="text-left font-medium px-4 py-2.5">Description</th>
								<th className="text-left font-medium px-4 py-2.5">Permissions</th>
								<th className="text-left font-medium px-4 py-2.5">Members</th>
								<th className="text-left font-medium px-4 py-2.5">Type</th>
								<th className="w-28" />
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{roles.map((role) => (
								<tr key={role.id} className="hover:bg-gray-50">
									<td className="px-4 py-3">
										<Typography.T3 weight="semibold" className="text-gray-950 capitalize">
											{role.name}
										</Typography.T3>
									</td>
									<td className="px-4 py-3">
										<Typography.T5 className="text-gray-600 line-clamp-1 max-w-64">
											{role.description ?? "—"}
										</Typography.T5>
									</td>
									<td className="px-4 py-3">
										<Badge size="xs" variant="info">
											{role.permissions.length} permissions
										</Badge>
									</td>
									<td className="px-4 py-3">
										<Typography.T5 className="text-gray-600">
											{role.membersCount}
										</Typography.T5>
									</td>
									<td className="px-4 py-3">
										<Badge
											radius="rounded"
											size="xs"
											dot
											variant={role.isSystem ? "secondary" : "success"}
										>
											{role.isSystem ? "System" : "Custom"}
										</Badge>
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-2">
											<Button
												variant="outline"
												size="xs"
												onClick={() => setDialog({ mode: "view", role })}
											>
												View
											</Button>
											{!role.isSystem && (
												<>
													<Button
														variant="outline"
														size="xs"
														onClick={() => setDialog({ mode: "edit", role })}
													>
														Edit
													</Button>
													<Button
														variant="outline"
														size="xs"
														onClick={() => setDeleteTarget(role)}
													>
														Delete
													</Button>
												</>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

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
