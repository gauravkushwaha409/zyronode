import { FormInput, FormTextarea, FormWrapper } from "@package/form";
import {
	Badge,
	Button,
	cn,
	Label,
	RadioGroup,
	RadioGroupItem,
	Typography,
} from "@package/ui";
import { FormHeader } from "@/features/auth/components";
import { useUserOnboardingForm, useUserOnboardingMutation } from "../../hooks";

const DISCOVER = [
	"Google",
	"YouTube",
	"LinkedIn",
	"Facebook",
	"Instagram",
	"Blog",
	"Podcast",
	"Advertisement",
	"Other",
];

export const UserOnboarding = () => {
	const userOnboardingForm = useUserOnboardingForm();
	const useOnboardingMutation = useUserOnboardingMutation();

	const handleSubmit = userOnboardingForm.form.handleSubmit(
		(data) => {
			useOnboardingMutation.mutate({
				firstName: data.firstName,
				lastName: data.lastName,
				theme: data.theme,
				referralSource:
					data.discoverSource === "Other"
						? (data.otherSource?.trim() ?? "")
						: (data.discoverSource ?? ""),
			});
		},
		(error) => {
			console.error("Form Errors:", error);
		},
	);

	return (
		<FormWrapper
			useFormMethods={userOnboardingForm.form}
			formProps={{ onSubmit: handleSubmit }}
		>
			<section className="space-y-5 2xl:space-y-10">
				<FormHeader
					heading="Personalize Your Experience"
					description="Select your preferred theme and tell us how you discovered us to help tailor your onboarding experience."
				/>
				<section className="space-y-2 2xl:space-y-5">
					<div className="grid grid-cols-2 gap-4">
						<FormInput
							name="firstName"
							label="First Name"
							placeholder="e.g. John"
							required
						/>
						<FormInput
							name="lastName"
							label="Last Name"
							placeholder="e.g. Doe"
							required
						/>
					</div>
					<Typography.T3 weight="medium" className="text-gray-600">
						Choose your preferred theme for system
					</Typography.T3>

					<RadioGroup
						value={userOnboardingForm.form.watch("theme")}
						onValueChange={(value) =>
							userOnboardingForm.form.setValue("theme", value as "light" | "dark", {
								shouldValidate: true,
							})
						}
						className="flex flex-row gap-9"
					>
						<div className="flex flex-col gap-3 2xl:gap-5 justify-center items-center">
							<img src="/images/verify/onboarding/light-mode.svg" alt="light-mode" />
							<div className="flex items-center gap-3 cursor-pointer">
								<RadioGroupItem id="light" value="light" />
								<Label htmlFor="light">Light Mode</Label>
							</div>
						</div>

						<div className="flex flex-col gap-3 2xl:gap-5 justify-center items-center">
							<img src="/images/verify/onboarding/dark-mode.svg" alt="dark-mode" />
							<div className="flex items-center gap-3 cursor-pointer">
								<RadioGroupItem id="dark" value="dark" />
								<Label htmlFor="dark">Dark Mode</Label>
							</div>
						</div>
					</RadioGroup>
				</section>

				<section className="space-y-2 2xl:space-y-5">
					<Typography.T3 weight="medium" className="text-gray-600">
						How Did You Discover Us?
					</Typography.T3>

					<div className="flex flex-wrap gap-2 2xl:gap-3">
						{DISCOVER.map((item) => {
							const isSelected =
								userOnboardingForm.form.watch("discoverSource") === item;

							return (
								<Badge
									key={item}
									size="lg"
									variant={isSelected ? "magenta" : "default"}
									className={cn("cursor-pointer transition-colors")}
									onClick={() =>
										userOnboardingForm.form.setValue("discoverSource", item, {
											shouldValidate: true,
										})
									}
								>
									{item}
								</Badge>
							);
						})}
					</div>

					{userOnboardingForm.form.watch("discoverSource") === "Other" && (
						<FormTextarea
							name="otherSource"
							placeholder="Tell us how you discovered us..."
						/>
					)}
				</section>

				<Button
					type="submit"
					disabled={
						useOnboardingMutation.isPending ||
						!userOnboardingForm.form.formState.isValid
					}
				>
					{useOnboardingMutation.isPending ? "Submitting..." : "Next"}
				</Button>
			</section>
		</FormWrapper>
	);
};
