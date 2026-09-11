import { useForm } from "@package/form";
import { type TeamFormSchema, teamFormSchema } from "../../schema";

export function useTeamForm() {
	return useForm<TeamFormSchema>({
		schema: teamFormSchema,
		defaultValues: {
			name: "",
			description: "",
			leaderId: "",
		},
	});
}
