import {
	FormInput,
	FormTextarea,
	FormWrapper,
	useFormContext,
} from "@package/form";
import {
	Button,
	Checkbox,
	DialogWrapper,
	PopoverWrapper,
	Typography,
} from "@package/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRoleForm } from "../../hooks/form-handler";
import type { RoleFormSchema } from "../../schema";
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
	const form = useRoleForm();
	const isReadOnly = mode === "view";
	const permissionError = form.formState.errors.permissionIds?.message as
		| string
		| undefined;

	useEffect(() => {
		if (!open) return;
		form.reset({
			name: role?.name ?? "",
			description: role?.description ?? "",
			permissionIds: role?.permissions.map((p) => p.id) ?? [],
		});
	}, [open, role, form]);

	const groups = useMemo(() => {
		const map = new Map<string, PermissionItem[]>();
		for (const permission of permissions) {
			const group = map.get(permission.module) ?? [];
			group.push(permission);
			map.set(permission.module, group);
		}
		return [...map.entries()];
	}, [permissions]);

	const handleSubmit = form.handleSubmit((payload) => {
		onSubmit({
			name: payload.name,
			description: payload.description || undefined,
			permissionIds: payload.permissionIds,
		});
	});

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
							onClick={() => handleSubmit()}
						>
							{mode === "create" ? "Create role" : "Save changes"}
						</Button>
					</>
				)
			}
		>
			<FormWrapper
				useFormMethods={form}
				formProps={{ className: "space-y-4", onSubmit: handleSubmit }}
			>
				<FormInput
					name="name"
					label="Role name"
					required
					placeholder="e.g. Support Lead"
					disabled={isReadOnly}
				/>
				<FormTextarea
					name="description"
					label="Description"
					placeholder="What does this role do?"
					rows={3}
					textareaProps={{ disabled: isReadOnly }}
				/>

				<div className="flex flex-col gap-1">
					<Typography.T5 weight="medium" className="text-gray-700">
						Permissions
					</Typography.T5>
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
											<PermissionCheckbox key={permission.id} permission={permission} />
										))}
									</div>
								</fieldset>
							))}
						</div>
					)}
					{permissionError && (
						<Typography.T6 className="text-alert-500">
							{permissionError}
						</Typography.T6>
					)}
				</div>
			</FormWrapper>
		</DialogWrapper>
	);
}

function PermissionCheckbox({ permission }: { permission: PermissionItem }) {
	const { watch, setValue } = useFormContext<RoleFormSchema>();
	const permissionIds = watch("permissionIds");
	const checked = permissionIds.includes(permission.id);

	const toggle = () => {
		setValue(
			"permissionIds",
			checked
				? permissionIds.filter((id) => id !== permission.id)
				: [...permissionIds, permission.id],
			{ shouldDirty: true, shouldValidate: true },
		);
	};

	const popover = usePermissionHoverPopover();

	const checkbox = (
		<label
			htmlFor={`permission-${permission.id}`}
			className="flex cursor-pointer items-center gap-2"
		>
			<Checkbox
				id={`permission-${permission.id}`}
				checked={checked}
				onCheckedChange={toggle}
			/>
			<span className="typo-t3 text-gray-700">{permission.name}</span>
		</label>
	);

	if (!permission?.description) return checkbox;

	return (
		<PopoverWrapper
			open={popover.open}
			onOpenChange={(next) => {
				if (!next) popover.close();
			}}
			title={permission.name}
			description={permission.description}
			align="start"
			sideOffset={6}
			Trigger={() => checkbox}
			popoverTriggerProps={{
				onMouseEnter: popover.keepOpen,
				onMouseLeave: popover.scheduleClose,
			}}
			className="p-3"
		>
			<span onMouseEnter={popover.keepOpen} onMouseLeave={popover.scheduleClose}>
				<Typography.T6 className="text-gray-500">
					{permission.description}
				</Typography.T6>
			</span>
		</PopoverWrapper>
	);
}

function usePermissionHoverPopover() {
	const [open, setOpen] = useState(false);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const keepOpen = () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
		setOpen(true);
	};

	const scheduleClose = () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
		closeTimer.current = setTimeout(() => setOpen(false), 120);
	};

	const close = () => setOpen(false);

	return { open, keepOpen, scheduleClose, close };
}
