import { PageHeader } from "@package/ui";
import {
	AssignAgentDialog,
	DashboardStats,
	EditVisitorDetailsDialog,
	TabbedUIVisitor,
	VisitorDetailsDrawer,
} from "@/features/live-visitor/components";
import { LiveVisitorProvider } from "@/features/live-visitor/providers";

interface LiveVisitorPageProps {
	organizationId: string;
}

export function LiveVisitorPage({ organizationId }: LiveVisitorPageProps) {
	return (
		<LiveVisitorProvider organizationId={organizationId}>
			<div className="h-full overflow-y-auto">
				<PageHeader
					title="Live Visitors"
					description="Monitor and engage with your website visitors in real time"
					className="border-b border-gray-border-200 px-6 py-4.5"
				/>

				<div className="flex flex-col gap-6 p-6">
					<DashboardStats organizationId={organizationId} />
					<TabbedUIVisitor organizationId={organizationId} />
				</div>

				<VisitorDetailsDrawer organizationId={organizationId} />
				<EditVisitorDetailsDialog organizationId={organizationId} />
				<AssignAgentDialog organizationId={organizationId} />
			</div>
		</LiveVisitorProvider>
	);
}
