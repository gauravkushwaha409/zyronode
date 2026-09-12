import { useForm } from "@package/form";
import {
	type TeamInvitationFormSchema,
	teamInvitationFormSchema,
} from "../../schema";

export function useTeamInvitationForm() {
	return useForm<TeamInvitationFormSchema>({
		schema: teamInvitationFormSchema,
		defaultValues: {
			email: "",
			teamId: "",
			roleId: "",
		},
	});
}
