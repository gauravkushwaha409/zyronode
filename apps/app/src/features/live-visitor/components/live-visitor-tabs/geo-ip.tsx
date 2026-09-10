import { EmptyState, FlagImage, Typography } from "@package/ui";
import {
	useVisitorByCountryQuery,
	useVisitorListQuery,
	useVisitorTopPagesQuery,
} from "../../hooks";
import { skeletonKeys } from "../../utility";
import { type RankedBarDatum, RankedBarList } from "./ranked-bar-list";
import { VisitorMap } from "./visitor-map";

interface GeoIpProps {
	organizationId: string;
}

export function GeoIp({ organizationId }: GeoIpProps) {
	// a high limit here so the map plots the whole population, not one page
	const { data: listData, isLoading: listLoading } = useVisitorListQuery(
		organizationId,
		{ limit: 100 },
	);
	const { data: countryData, isLoading: countryLoading } =
		useVisitorByCountryQuery(organizationId);
	const { data: pagesData, isLoading: pagesLoading } =
		useVisitorTopPagesQuery(organizationId);

	const visitors = listData?.data?.data?.data ?? [];
	const countries = countryData?.data?.data?.countries ?? [];
	const pages = pagesData?.data?.data?.pages ?? [];

	const countryBars: RankedBarDatum[] = countries.map((row) => ({
		key: row.country,
		labelText: row.country,
		value: row.count,
		percentage: row.percentage,
		label: (
			<>
				<FlagImage countryCode={row.countryCode} />
				<Typography.T5 className="truncate text-gray-800">
					{row.country}
				</Typography.T5>
			</>
		),
	}));

	const pageBars: RankedBarDatum[] = pages.map((row) => ({
		key: row.url,
		labelText: row.url,
		value: row.count,
		percentage: row.percentage,
		label: (
			<Typography.T5 className="truncate text-gray-800" title={row.url}>
				{row.url}
			</Typography.T5>
		),
	}));

	return (
		<div className="flex flex-col gap-6">
			<section className="rounded-[12px] border border-gray-border-200 bg-white-base p-4">
				<CardTitle className="mb-3">Visitor locations</CardTitle>
				{listLoading ? (
					<div className="h-80 animate-pulse rounded-[10px] bg-gray-100" />
				) : (
					<VisitorMap visitors={visitors} />
				)}
			</section>

			<div className="grid gap-6 lg:grid-cols-2">
				<section className="rounded-[12px] border border-gray-border-200 bg-white-base p-4">
					<CardTitle className="mb-4">Visitors by country</CardTitle>
					{countryLoading ? (
						<ChartSkeleton />
					) : countryBars.length === 0 ? (
						<EmptyState size="sm" icon="location" title="No country data yet" />
					) : (
						<RankedBarList data={countryBars} unit="visitor" />
					)}
				</section>

				<section className="rounded-[12px] border border-gray-border-200 bg-white-base p-4">
					<CardTitle className="mb-4">Top pages</CardTitle>
					{pagesLoading ? (
						<ChartSkeleton />
					) : pageBars.length === 0 ? (
						<EmptyState size="sm" icon="browser" title="No page views yet" />
					) : (
						<RankedBarList data={pageBars} unit="view" />
					)}
				</section>
			</div>
		</div>
	);
}

function CardTitle({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Typography.T2
			weight="semibold"
			className={`text-gray-950 ${className ?? ""}`}
		>
			{children}
		</Typography.T2>
	);
}

function ChartSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			{skeletonKeys(5, "chart").map((key) => (
				<div key={key} className="flex flex-col gap-1.5">
					<div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
					<div className="h-1.5 w-full animate-pulse rounded-full bg-gray-100" />
				</div>
			))}
		</div>
	);
}
