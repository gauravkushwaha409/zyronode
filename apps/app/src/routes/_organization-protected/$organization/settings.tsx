import { InnerSidebar } from "@/components/shared/inner-sidebar";
import { SETTINGS_SIDEBAR_DATA } from "@/features/settings/constants/settings-sidebar.constants";
import { PageBreadcrumb } from "@package/ui";
import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_organization-protected/$organization/settings")({
	beforeLoad: ({ location, params }) => {
		const isRoot =
			location.pathname === `/${params.organization}/settings` ||
			location.pathname === `/${params.organization}/settings/`;
		if (isRoot) {
			throw redirect({
				to: "/$organization/settings/account-settings/account-information",
				params,
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const pathSegments = pathname.split("/settings/").at(1)?.split("/").filter(Boolean) ?? [];
	return (
		<section className="flex flex-row h-full">
			<InnerSidebar pageHeader="Settings" data={SETTINGS_SIDEBAR_DATA} />
			<section className="flex-1 flex flex-col h-full min-w-0 min-h-0">
				<PageBreadcrumb pathSegments={pathSegments} icon="settings" />
				<div className="min-h-0 flex-1 overflow-y-auto p-6 bg-background-base">
					<Outlet />
				</div>
			</section>
		</section>
	);
}
