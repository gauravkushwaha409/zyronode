import type { PermissionItem, RoleItem } from "./roles.types";

export namespace RoleForm {
	export type Mode = "create" | "edit" | "view";

	export interface Payload {
		name: string;
		description?: string;
		permissionIds: string[];
	}

	export interface Props {
		open: boolean;
		mode: Mode;
		role?: RoleItem;
		permissions: PermissionItem[];
		onOpenChange: (open: boolean) => void;
		onSubmit: (payload: Payload) => void;
		isSubmitting?: boolean;
	}
}
