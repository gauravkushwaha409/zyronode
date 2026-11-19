import { createFileRoute } from "@tanstack/react-router";
import { OrganizationsList } from "@/features/organizations/components/organizations-list";

export const Route = createFileRoute("/_shell/organizations")({
	component: OrganizationsList,
});
