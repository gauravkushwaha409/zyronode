import type { Team, UserSummary } from "./teams.types";

export namespace TeamForm {
	export type Mode = "create" | "edit" | "view";

	export interface Payload {
		name: string;
		description?: string;
		leaderId?: string;
	}

	export interface Props {
		open: boolean;
		mode: Mode;
		team?: Team.Item;
		members?: UserSummary[];
		onOpenChange: (open: boolean) => void;
		onSubmit: (payload: Payload) => void;
		isSubmitting?: boolean;
	}
}
