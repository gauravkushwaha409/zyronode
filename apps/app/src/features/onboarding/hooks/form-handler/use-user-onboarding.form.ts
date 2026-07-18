import { useForm } from "@package/form";
import { type UserOnboardingSchema, userOnboardingSchema } from "../../schemas";

export function useUserOnboardingForm() {
	const form = useForm<UserOnboardingSchema>({
		schema: userOnboardingSchema,
		defaultValues: {
			firstName: "",
			lastName: "",
			theme: "light",
			discoverSource: "",
			otherSource: undefined,
		},
		mode: "onChange",
	});

	return { form };
}
