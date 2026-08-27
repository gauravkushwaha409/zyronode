import { StatsCard } from "@package/ui";
import { useVisitorStatCardsQuery } from "../hooks";

interface DashboardStatsProps {
	organizationId: string;
}

export function DashboardStats({ organizationId }: DashboardStatsProps) {
	const { data, isLoading } = useVisitorStatCardsQuery(organizationId);
	const stats = data?.data?.data;

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{[0, 1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-[92px] animate-pulse rounded-[12px] border border-gray-300 bg-gray-50"
					/>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatsCard
				icon="online-only"
				title="Online now"
				statNum={stats?.online ?? 0}
			/>
			<StatsCard
				icon="accounts"
				title="Visitors today"
				statNum={stats?.today ?? 0}
			/>
			<StatsCard
				icon="contacts"
				title="Identified"
				statNum={stats?.identified ?? 0}
			/>
			<StatsCard
				icon="all-conversation"
				title="Total visitors"
				statNum={stats?.total ?? 0}
			/>
		</div>
	);
}
