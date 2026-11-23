import { createFileRoute } from "@tanstack/react-router";
import { PlansList } from "@/features/plans/components/plans-list";

export const Route = createFileRoute("/_shell/billing")({
	component: PlansList,
});
