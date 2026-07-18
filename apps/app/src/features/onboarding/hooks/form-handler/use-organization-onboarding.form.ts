import { useForm } from "@package/form";
import {
	type OrganizationOnboardingSchema,
	organizationOnboardingSchema,
} from "../../schemas";

export function useOrganizationOnboardingForm() {
	const form = useForm<OrganizationOnboardingSchema>({
		schema: organizationOnboardingSchema,
		defaultValues: {
			description: "",
			step: 1,
			name: "",
			domain: "",
			logo: "",
			onboarding: {
				size_range: "",
				industry: "",
				use_case: [],
				previous_tool: "",
			},
		},
	});

	form.watch("step");

	const handleOrganizationNextStep = () => {
		const currentStep = form.getValues("step");
		form.setValue("step", currentStep + 1);
	};

	const handleSkip = () => {
		const currentStep = form.getValues("step");
		if (currentStep < 5) {
			form.setValue("step", currentStep + 1);
		}
	};

	const validateStep = async (step: number): Promise<boolean> => {
		switch (step) {
			case 1: {
				const valid = await form.trigger(["name", "domain", "description"]);
				if (valid) handleOrganizationNextStep();
				return valid;
			}
			case 2: {
				const valid = await form.trigger(["onboarding.industry"]);
				if (valid) handleOrganizationNextStep();
				return valid;
			}
			case 3: {
				const valid = await form.trigger(["onboarding.size_range"]);
				if (valid) handleOrganizationNextStep();
				return valid;
			}
			case 4: {
				const valid = await form.trigger(["onboarding.previous_tool"]);
				if (valid) handleOrganizationNextStep();
				return valid;
			}
			default:
				return false;
		}
	};

	const handleServerErrors = (errors?: Record<string, string | undefined>) => {
		if (!errors) return;

		const fieldToStep: Record<string, number> = {
			name: 1,
			domain: 1,
			description: 1,
			logo: 2,
			onboarding: 2,
		};

		let minStep = 5;

		for (const field of Object.keys(errors)) {
			const step = fieldToStep[field];
			if (step && step < minStep) {
				minStep = step;
			}
		}

		if (minStep < 5) {
			form.setValue("step", minStep);
		}
	};

	return {
		form,
		handleOrganizationNextStep,
		handleSkip,
		validateStep,
		handleServerErrors,
	};
}
