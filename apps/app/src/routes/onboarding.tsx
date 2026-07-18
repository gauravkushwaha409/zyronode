import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OnboardingSidebar } from "@/features/onboarding/components";
import { ONBOARDING_STEPS } from "@/features/onboarding/config";

export const Route = createFileRoute("/onboarding")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const auth = context.auth;

	},
});

function RouteComponent() {
	return (
		<section className="flex flex-row h-screen bg-white-base">
			<div className="h-full flex-1 flex flex-col py-8 2xl:py-16 px-16 2xl:px-36">
				<Outlet />
			</div>

			<OnboardingSidebar
				currentData={ONBOARDING_STEPS[0]}
				currentFlowStepKey={0}
			/>
		</section>
	);
}
