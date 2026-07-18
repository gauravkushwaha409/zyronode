import { Button, Icon, OnboardingSlider, Typography } from "@package/ui";
import { ONBOARDING_STEPS } from "@/features/onboarding/config";
import type { OnboardingStep } from "@/features/onboarding/types";

interface OnboardingSidebarProps {
	currentData: OnboardingStep;
	currentFlowStepKey: number;
}

export function OnboardingSidebar({
	currentData,
	currentFlowStepKey,
}: OnboardingSidebarProps) {
	return (
		<div className="flex w-3/10 flex-col 2xl:w-137.5 pl-8 2xl:pl-11 bg-primary-100 gap-8 2xl:gap-16 h-full overflow-hidden">
			<div className="mt-8 2xl:mt-16 flex justify-between items-center pr-8 2xl:pr-11 z-10">
				<div className="flex items-center gap-1.5 select-none">
					<Icon name="chatboq-logo" size={40} />
					<img alt="chatboq" src="/images/chatboq.svg" className="h-5" />
				</div>
				<Button
					variant="alert"
					size="lg"
					className="w-26 flex items-center justify-center cursor-pointer"
					onClick={() => {
						window.location.href = "/auth/logout";
					}}
				>
					Sign out
				</Button>
			</div>

			<div
				key={currentFlowStepKey}
				className="flex-1 flex flex-col gap-8 2xl:gap-16 overflow-hidden animate-in fade-in duration-500 ease-in-out"
			>
				<div className="space-y-3 2xl:space-y-5 pr-8 2xl:pr-11">
					<Typography.H2
						weight="semibold"
						className="text-gray-950 max-2xl:text-2xl leading-tight"
					>
						{currentData.heading}
					</Typography.H2>
					<Typography.H6
						weight="regular"
						className="text-gray-500 max-2xl:text-base tracking-wide"
					>
						{currentData.description}
					</Typography.H6>
				</div>

				<div className="flex-1 relative overflow-hidden select-none">
					<OnboardingSlider slides={ONBOARDING_STEPS} />
				</div>
			</div>
		</div>
	);
}
