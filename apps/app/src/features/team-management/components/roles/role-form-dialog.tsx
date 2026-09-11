import {
	Button,
	Checkbox,
	DialogWrapper,
	Input,
	Label,
	Typography,
} from "@package/ui";
import { useEffect, useMemo, useState } from "react";
import { roleFormSchema } from "../../schema";
import type { PermissionItem, RoleItem } from "../../types";

export type RoleFormMode = "create" | "edit" | "view";

export interface RoleFormPayload {
	name: string;
	description?: string;
	permissionIds: string[];
}

interface RoleFormDialogProps {
	open: boolean;
	mode: RoleFormMode;
	role?: RoleItem;
	permissions: PermissionItem[];
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: RoleFormPayload) => void;
	isSubmitting?: boolean;
}

const MODE_TITLE: Record<RoleFormMode, string> = {
	create: "Create role",
	edit: "Edit role",
	view: "View role",
};

export function RoleFormDialog({
	open,
	mode,
	role,
	permissions,
	onOpenChange,
	onSubmit,
	isSubmitting = false,
}: RoleFormDialogProps) {
	const isReadOnly = mode === "view";

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [permissionIds, setPermissionIds] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setName(role?.name ?? "");
		setDescription(role?.description ?? "");
		setPermissionIds(role?.permissions.map((p) => p.id) ?? []);
		setError(null);
	}, [open, role]);

	const groups = useMemo(() => {
		const map = new Map<string, PermissionItem[]>();
		for (const permission of permissions) {
			const group = map.get(permission.module) ?? [];
			group.push(permission);
			map.set(permission.module, group);
		}
		return [...map.entries()];
	}, [permissions]);

	const togglePermission = (permissionId: string) => {
		setPermissionIds((current) =>
			current.includes(permissionId)
				? current.filter((id) => id !== permissionId)
				: [...current, permissionId],
		);
	};

	const handleSubmit = () => {
		const parsed = roleFormSchema.safeParse({
			name,
			description,
			permissionIds,
		});
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Invalid input");
			return;
		}
		setError(null);
		onSubmit({
			name: parsed.data.name,
			description: parsed.data.description || undefined,
			permissionIds: parsed.data.permissionIds,
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
					? `${role?.name ?? "Role"} permissions are fixed.`
					: "Define the access level, then assign the permissions for this role."
			}
			bodyClassName="max-h-[55vh]"
			footer={
				isReadOnly ? (
					<Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				) : (
					<>
						<Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
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
					</>
				)
			}
		>
			<div className="space-y-4">
				<fieldset disabled={isReadOnly} className="space-y-4">
					<LabelField label="Role name">
						<Input
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="e.g. Support Lead"
						/>
					</LabelField>
					<LabelField label="Description">
						<textarea
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="What does this role do?"
							rows={3}
							className="w-full rounded-[6px] border border-gray-200 bg-white px-3 py-2 typo-t3 text-gray-950 outline-none focus:border-primary-500 resize-none"
						/>
					</LabelField>
				</fieldset>

				<div className="flex flex-col gap-1">
					<Label>
						<Typography.T5 weight="medium" className="text-gray-700">
							Permissions
						</Typography.T5>
					</Label>
					{groups.length === 0 ? (
						<Typography.T6 className="text-gray-500">
							No permissions available.
						</Typography.T6>
					) : (
						<div className="grid grid-cols-2 gap-x-8 gap-y-5 rounded-md border border-gray-200 bg-gray-50 p-4 max-h-60 overflow-y-auto">
							{groups.map(([module, modulePermissions]) => (
								<fieldset key={module} disabled={isReadOnly}>
									<legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
										{module}
									</legend>
									<div className="flex flex-col gap-1.5">
										{modulePermissions.map((permission) => (
											<label
												key={permission.id}
												htmlFor={`permission-${permission.id}`}
												className="flex cursor-pointer items-center gap-2"
											>
												<Checkbox
													id={`permission-${permission.id}`}
													checked={permissionIds.includes(permission.id)}
													onCheckedChange={() => togglePermission(permission.id)}
												/>
												<span className="typo-t3 text-gray-700">{permission.name}</span>
											</label>
										))}
									</div>
								</fieldset>
							))}
						</div>
					)}
				</div>

				{error ? (
					<Typography.T6 className="text-alert-500">{error}</Typography.T6>
				) : null}
			</div>
		</DialogWrapper>
	);
}

function LabelField({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<Label>
				<Typography.T5 weight="medium" className="text-gray-700">
					{label}
				</Typography.T5>
			</Label>
			{children}
		</div>
	);
}
