import type { Permission, Role } from "./roles.types";

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
		role?: Role.Item;
		permissions: Permission.Item[];
		onOpenChange: (open: boolean) => void;
		onSubmit: (payload: Payload) => void;
		isSubmitting?: boolean;
	}
}
