import { createFileRoute } from "@tanstack/react-router";
import { OnboardingSuccess } from "@/features/onboarding/components";

export const Route = createFileRoute("/onboarding/success")({
	component: RouteComponent,
});

function RouteComponent() {
	return <OnboardingSuccess />;
}
