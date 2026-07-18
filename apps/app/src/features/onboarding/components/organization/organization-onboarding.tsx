import {
	FormInput,
	FormTextarea,
	FormWrapper,
	useFormContext,
	useWatch,
} from "@package/form";
import { Badge, Button, Icon, Textarea, Typography } from "@package/ui";
import { useState } from "react";
import { FormHeader } from "@/features/auth/components";
import { TEAM_SIZE } from "@/features/onboarding/config";
import type { OrganizationOnboardingSchema } from "@/features/onboarding/schemas";
import {
	useOrganizationOnboardingForm,
	useOrganizationOnboardingMutation,
} from "../../hooks";

const INDUSTRIES = [
	{ label: "IT", value: "it" },
	{ label: "Healthcare", value: "healthcare" },
	{ label: "Finance", value: "finance" },
	{ label: "Education", value: "education" },
	{ label: "Other", value: "other" },
];

const TOOLS = [
	"Zendesk",
	"Live Chat",
	"Freshdesk",
	"Tidio",
	"Crisp",
	"Hubspot",
	"I'm not using",
	"Other",
];

const SUCCESS = [
	"Improve Customer Experience",
	"Marketing Campaigns",
	"Automate Support Task",
	"Centralize Support System",
	"Hubspot",
	"Chat With My Visitors",
	"Just Being Curious",
	"Other",
];

function Step1OrgInfo({ handleNext }: { handleNext: () => void }) {
	const { formState, control } = useFormContext<OrganizationOnboardingSchema>();
	const name = useWatch({ control, name: "name" });
	const domain = useWatch({ control, name: "domain" });

	const isDisabled =
		!name ||
		!domain ||
		!!formState.errors.name ||
		!!formState.errors.domain ||
		!!formState.errors.description;

	return (
		<section className="space-y-10 w-full">
			<FormHeader
				heading="Let's Set Up Your Organization"
				description="Tell us about your company so we can personalize your inbox, workflows, and customer experience from day one."
			/>
			<div className="space-y-6">
				<FormInput
					name="name"
					label="Name of your company"
					placeholder="Your Company"
					required
				/>
				<FormInput
					name="domain"
					label="Your website domain (url)"
					placeholder="company.com"
					required
				/>
				<FormTextarea
					size="lg"
					name="description"
					label="Description"
					placeholder="Tell us about your company"
					hint="Maximum of number of characters is 500"
				/>
				<Button type="button" onClick={handleNext} disabled={isDisabled}>
					Continue
				</Button>
			</div>
		</section>
	);
}

function Step2Industry({
	handleNext,
	handleSkip,
}: {
	handleNext: () => void;
	handleSkip: () => void;
}) {
	const { setValue, watch } = useFormContext<OrganizationOnboardingSchema>();
	const selectedIndustry = watch("onboarding.industry");

	return (
		<section className="space-y-10 w-full">
			<FormHeader
				heading="Help Us Understand Your Business"
				description="Your industry and brand identity help us tailor conversations, automation, and support experiences to your workflow."
			/>

			<section className="space-y-6">
				<Typography.T3 weight="medium" className="text-gray-600">
					Industry Type
				</Typography.T3>

				<div className="flex flex-wrap gap-2 2xl:gap-3">
					{INDUSTRIES.map((item) => (
						<Badge
							key={item.value}
							size="lg"
							variant={selectedIndustry === item.value ? "magenta" : "default"}
							className="cursor-pointer transition-colors font-medium"
							onClick={() =>
								setValue("onboarding.industry", item.value, { shouldValidate: true })
							}
						>
							{item.label}
						</Badge>
					))}
				</div>
			</section>

			<div className="grid grid-cols-2 gap-5">
				<Button type="button" onClick={handleNext}>
					Continue
				</Button>
				<Button type="button" onClick={handleSkip} variant="secondary">
					Skip
				</Button>
			</div>
		</section>
	);
}

function Step3TeamSize({
	handleNext,
	handleSkip,
}: {
	handleNext: () => void;
	handleSkip: () => void;
}) {
	const { setValue, control } = useFormContext<OrganizationOnboardingSchema>();
	const selectedTeamSize = useWatch({ control, name: "onboarding.size_range" });

	return (
		<section className="space-y-10 w-full">
			<FormHeader
				heading="Built Around Your Team Size"
				description="We'll optimize collaboration, permissions, and workflows based on how your team operates"
			/>

			<section className="space-y-5">
				<Typography.T3 weight="medium" className="text-gray-600">
					Company Size
				</Typography.T3>

				<div className="flex flex-wrap gap-2 2xl:gap-3">
					{TEAM_SIZE.map((item) => {
						const isSelected = selectedTeamSize === item.value;
						return (
							<Badge
								key={item.value}
								size="lg"
								variant={isSelected ? "magenta" : "default"}
								className="cursor-pointer transition-colors font-medium"
								onClick={() => setValue("onboarding.size_range", item.value)}
							>
								{item.label}
							</Badge>
						);
					})}
				</div>
			</section>

			<div className="grid grid-cols-2 gap-5">
				<Button type="button" onClick={handleNext}>
					Next
				</Button>
				<Button onClick={handleSkip} variant="secondary">
					Skip
				</Button>
			</div>
		</section>
	);
}

function Step4Tool({
	handleNext,
	handleSkip,
}: {
	handleNext: () => void;
	handleSkip?: () => void;
}) {
	const { setValue, control } = useFormContext<OrganizationOnboardingSchema>();
	const selectedTool = useWatch({ control, name: "onboarding.previous_tool" });
	const [otherTool, setOtherTool] = useState("");

	return (
		<section className="space-y-10">
			<FormHeader
				heading="Switching From Another Tool?"
				description="Understanding your existing setup helps us personalize your experience more effectively"
			/>

			<section className="space-y-4">
				<Typography.T3 weight="medium" className="text-gray-600">
					Which Tool do you use?
				</Typography.T3>

				<div className="flex flex-wrap gap-2 2xl:gap-3">
					{TOOLS.map((item) => (
						<Badge
							key={item}
							size="lg"
							variant={selectedTool === item ? "magenta" : "default"}
							className="cursor-pointer transition-colors font-medium"
							onClick={() => setValue("onboarding.previous_tool", item)}
						>
							{item}
						</Badge>
					))}
				</div>

				{selectedTool === "Other" && (
					<Textarea
						placeholder="Tell us which tool you use..."
						value={otherTool}
						onChange={(e) => setOtherTool(e.target.value)}
					/>
				)}
			</section>

			<div className="grid grid-cols-2 gap-5">
				<Button onClick={handleNext}>Next</Button>
				<Button variant="secondary" onClick={handleSkip}>
					Skip
				</Button>
			</div>
		</section>
	);
}

function Step5Success({ handleNext }: { handleNext: () => void }) {
	const { setValue, control } = useFormContext<OrganizationOnboardingSchema>();
	const selectedUseCase =
		useWatch({ control, name: "onboarding.use_case" }) || [];
	const [otherText, setOtherText] = useState("");

	const handleToggleUseCase = (value: string) => {
		const updated = selectedUseCase.includes(value)
			? selectedUseCase.filter((item) => item !== value)
			: [...selectedUseCase, value];
		setValue("onboarding.use_case", updated);
	};

	return (
		<section className="space-y-10">
			<FormHeader
				heading="What Does Success Look Like For Your Team?"
				description="Choose what matters most so we can prioritize the right workflows, insights, and automation for your goals."
			/>

			<section className="space-y-5">
				<Typography.T3 weight="medium" className="text-gray-600">
					Select all that apply.
				</Typography.T3>

				<div className="flex flex-wrap gap-2 2xl:gap-3">
					{SUCCESS.map((item) => {
						const isSelected = selectedUseCase.includes(item);
						return (
							<Badge
								key={item}
								size="lg"
								variant={isSelected ? "magenta" : "default"}
								removable={isSelected && selectedUseCase.length > 1}
								onRemove={() => handleToggleUseCase(item)}
								className="cursor-pointer transition-colors font-medium"
								onClick={() => handleToggleUseCase(item)}
							>
								{item}
							</Badge>
						);
					})}
				</div>

				{selectedUseCase.includes("Other") && (
					<Textarea
						placeholder="Tell us your objective..."
						value={otherText}
						onChange={(e) => setOtherText(e.target.value)}
					/>
				)}
			</section>

			<div className="grid grid-cols-2 gap-5">
				<Button type="button" onClick={handleNext}>
					Submit
				</Button>
				<Button variant="secondary" onClick={handleNext}>
					Skip
				</Button>
			</div>
		</section>
	);
}

export const OrganizationOnboarding = () => {
	const organizationOnboardingForm = useOrganizationOnboardingForm();
	const organizationMutation = useOrganizationOnboardingMutation();

	const handleNextStep = async () => {
		const step = organizationOnboardingForm.form.getValues("step");

		if (step === 5) {
			organizationOnboardingForm.form.handleSubmit(async (values) => {
				organizationMutation.mutate(
					{
						name: values.name,
						domain: values.domain,
						...(values.description && { description: values.description }),
						onboarding: {
							size_range: values.onboarding.size_range,
							use_case: values.onboarding.use_case,
							industry: values.onboarding.industry,
							previous_tool: values.onboarding.previous_tool ?? "",
						},
						logo: values.logo ?? "",
					},
					{
						onError: (error) => {
							const fieldErrors = error?.response?.data?.errors;
							fieldErrors &&
								organizationOnboardingForm.handleServerErrors(fieldErrors as any);
						},
					},
				);
			})();
			return;
		}

		await organizationOnboardingForm.validateStep(step);
	};

	const step = organizationOnboardingForm.form.getValues("step");

	const stepComponents = () => {
		switch (step) {
			case 1:
				return <Step1OrgInfo handleNext={handleNextStep} />;
			case 2:
				return (
					<Step2Industry
						handleNext={handleNextStep}
						handleSkip={organizationOnboardingForm.handleSkip}
					/>
				);
			case 3:
				return (
					<Step3TeamSize
						handleNext={handleNextStep}
						handleSkip={organizationOnboardingForm.handleSkip}
					/>
				);
			case 4:
				return (
					<Step4Tool
						handleNext={handleNextStep}
						handleSkip={organizationOnboardingForm.handleSkip}
					/>
				);
			case 5:
				return <Step5Success handleNext={handleNextStep} />;
			default:
				return null;
		}
	};

	return (
		<FormWrapper
			useFormMethods={organizationOnboardingForm.form}
			formProps={{ onSubmit: handleNextStep, className: "w-full" }}
		>
			<section className="space-y-6 w-full">
				<div className="flex flex-row items-end justify-end gap-3">
					<Typography.T3 weight="medium" className="text-gray-500">
						Step {step} of 5
					</Typography.T3>
					<Icon
						name={
							step === 1
								? "step-1"
								: step === 2
									? "step-2"
									: step === 3
										? "step-3"
										: step === 4
											? "step-3"
											: "step-3"
						}
						size={24}
					/>
				</div>

				{stepComponents()}
			</section>
		</FormWrapper>
	);
};
