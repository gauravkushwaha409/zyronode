import {
	Badge,
	Button,
	Checkbox,
	cn,
	DialogWrapper,
	Input,
	Textarea,
	Typography,
} from "@package/ui";
import { useEffect, useMemo, useState } from "react";
import type { AdminPermission, AdminRole } from "../types";

export type RoleDialogMode = "create" | "edit" | "view";

interface RoleFormDialogProps {
	open: boolean;
	mode: RoleDialogMode;
	role?: AdminRole | null;
	permissions: AdminPermission[];
	isSubmitting?: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: {
		name: string;
		description?: string;
		permissionIds: string[];
	}) => void;
}

const MODE_TITLE: Record<RoleDialogMode, string> = {
	create: "Create Role",
	edit: "Edit Role",
	view: "Role Details & Permissions",
};

export function RoleFormDialog({
	open,
	mode,
	role,
	permissions,
	isSubmitting = false,
	onOpenChange,
	onSubmit,
}: RoleFormDialogProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
		[],
	);
	const [nameError, setNameError] = useState<string | null>(null);

	const isReadOnly = mode === "view";

	useEffect(() => {
		if (!open) return;
		setName(role?.name ?? "");
		setDescription(role?.description ?? "");
		setSelectedPermissionIds(role?.permissions.map((p) => p.id) ?? []);
		setNameError(null);
	}, [open, role]);

	const groups = useMemo(() => {
		const map = new Map<string, AdminPermission[]>();
		for (const permission of permissions) {
			const group = map.get(permission.module) ?? [];
			group.push(permission);
			map.set(permission.module, group);
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [permissions]);

	const togglePermission = (id: string) => {
		if (isReadOnly) return;
		setSelectedPermissionIds((prev) =>
			prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
		);
	};

	const toggleModuleAll = (modulePermissions: AdminPermission[]) => {
		if (isReadOnly) return;
		const moduleIds = modulePermissions.map((p) => p.id);
		const allSelected = moduleIds.every((id) =>
			selectedPermissionIds.includes(id),
		);

		if (allSelected) {
			setSelectedPermissionIds((prev) =>
				prev.filter((id) => !moduleIds.includes(id)),
			);
		} else {
			setSelectedPermissionIds((prev) => [
				...prev,
				...moduleIds.filter((id) => !prev.includes(id)),
			]);
		}
	};

	const handleSubmit = () => {
		if (isReadOnly) return;
		const trimmedName = name.trim();
		if (!trimmedName) {
			setNameError("Role name is required");
			return;
		}
		setNameError(null);
		onSubmit({
			name: trimmedName,
			description: description.trim() || undefined,
			permissionIds: selectedPermissionIds,
		});
	};

	return (
		<DialogWrapper
			open={open}
			onOpenChange={onOpenChange}
			size="xl"
			title={MODE_TITLE[mode]}
			description={
				isReadOnly
					? `${role?.name ?? "Role"} details and assigned permissions.`
					: "Define the role name, description, and assign system permissions."
			}
			bodyClassName="max-h-[60vh] overflow-y-auto pr-1"
			footer={
				isReadOnly ? (
					<Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				) : (
					<div className="flex w-full items-center justify-between">
						<div className="flex items-center gap-2">
							<Badge size="xs" variant="info">
								{selectedPermissionIds.length} of {permissions.length} selected
							</Badge>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="secondary"
								size="sm"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								isPending={isSubmitting}
								pendingText={mode === "create" ? "Creating..." : "Saving..."}
								onClick={handleSubmit}
							>
								{mode === "create" ? "Create role" : "Save changes"}
							</Button>
						</div>
					</div>
				)
			}
		>
			<div className="space-y-5">
				{role?.isSystem && (
					<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
						<span className="font-semibold">System Role:</span> This is a
						platform-level built-in role.
					</div>
				)}

				<div className="space-y-4">
					<div>
						<label
							htmlFor="role-name-input"
							className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
						>
							Role Name <span className="text-red-500">*</span>
						</label>
						<Input
							id="role-name-input"
							placeholder="e.g. Support Specialist"
							value={name}
							disabled={isReadOnly}
							onChange={(e) => {
								setName(e.target.value);
								if (nameError) setNameError(null);
							}}
							className="w-full"
						/>
						{nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
					</div>

					<div>
						<label
							htmlFor="role-description-input"
							className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
						>
							Description
						</label>
						<Textarea
							id="role-description-input"
							placeholder="Describe what access this role grants..."
							value={description}
							disabled={isReadOnly}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
							className="w-full text-sm"
						/>
					</div>
				</div>

				<div className="space-y-3 pt-2 border-t border-gray-100">
					<div className="flex items-center justify-between">
						<div>
							<Typography.T3 weight="semibold" className="text-gray-950">
								Permissions
							</Typography.T3>
							<Typography.T5 className="text-gray-500">
								Choose the permissions granted to users with this role
							</Typography.T5>
						</div>
						<Badge size="xs" variant="secondary">
							{selectedPermissionIds.length} / {permissions.length} selected
						</Badge>
					</div>

					<div className="space-y-4">
						{groups.map(([moduleName, modulePermissions]) => {
							const allInModuleSelected = modulePermissions.every((p) =>
								selectedPermissionIds.includes(p.id),
							);

							return (
								<div
									key={moduleName}
									className="rounded-lg border border-gray-border-50 bg-gray-fill-25 p-3.5 space-y-2.5"
								>
									<div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-xs uppercase tracking-wider text-gray-800">
												{moduleName} Module
											</span>
											<Badge size="xs" variant="secondary">
												{
													modulePermissions.filter((p) =>
														selectedPermissionIds.includes(p.id),
													).length
												}
												/{modulePermissions.length}
											</Badge>
										</div>
										{!isReadOnly && (
											<button
												type="button"
												onClick={() => toggleModuleAll(modulePermissions)}
												className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
											>
												{allInModuleSelected ? "Deselect All" : "Select All"}
											</button>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
										{modulePermissions.map((permission) => {
											const isChecked = selectedPermissionIds.includes(permission.id);
											return (
												<div
													key={permission.id}
													onClick={() => togglePermission(permission.id)}
													className={cn(
														"flex items-start gap-2.5 p-2 rounded-md transition-colors select-none",
														isReadOnly
															? "cursor-default"
															: "cursor-pointer hover:bg-white-base",
														isChecked
															? "bg-white-base border border-primary-200"
															: "border border-transparent",
													)}
												>
													<div className="pt-0.5">
														<Checkbox
															checked={isChecked}
															disabled={isReadOnly}
															onCheckedChange={() => togglePermission(permission.id)}
														/>
													</div>
													<div className="min-w-0 flex-1">
														<div className="flex items-center justify-between gap-1">
															<span className="text-xs font-semibold text-gray-900 truncate">
																{permission.name}
															</span>
															<span className="text-[10px] text-gray-400 font-mono">
																{permission.key}
															</span>
														</div>
														{permission.description && (
															<p className="text-[11px] text-gray-500 line-clamp-1">
																{permission.description}
															</p>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</DialogWrapper>
	);
}
