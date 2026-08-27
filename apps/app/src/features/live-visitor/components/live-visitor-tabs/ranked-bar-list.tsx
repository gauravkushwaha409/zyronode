import { Typography } from "@package/ui";
import type React from "react";

export interface RankedBarDatum {
	key: string;
	label: React.ReactNode;
	/** Text used for the tooltip / a11y description. */
	labelText: string;
	value: number;
	percentage: number;
}

interface RankedBarListProps {
	data: RankedBarDatum[];
	/** Unit noun for the tooltip, e.g. "visitor" / "view". */
	unit: string;
}

/**
 * Ranked horizontal bars.
 *
 * Magnitude comparison across many named categories, so length carries the
 * value and a single hue carries no meaning of its own - a pie would be
 * unreadable here once the shares get close together, and long country /
 * URL labels need the horizontal axis.
 */
export function RankedBarList({ data, unit }: RankedBarListProps) {
	// scale to the largest value, not to 100%, so small differences stay visible
	const max = Math.max(...data.map((d) => d.value), 1);

	return (
		<ul className="flex flex-col gap-2.5">
			{data.map((datum) => (
				<li key={datum.key} className="flex flex-col gap-1">
					<div className="flex items-baseline justify-between gap-3">
						<div className="flex min-w-0 items-center gap-1.5">{datum.label}</div>
						{/* direct label - never the series color, always text ink */}
						<Typography.T6 className="shrink-0 tabular-nums text-gray-500">
							{datum.value} · {datum.percentage}%
						</Typography.T6>
					</div>
					<div
						className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
						role="img"
						aria-label={`${datum.labelText}: ${datum.value} ${unit}${datum.value === 1 ? "" : "s"} (${datum.percentage}%)`}
						title={`${datum.labelText}: ${datum.value} ${unit}${datum.value === 1 ? "" : "s"}`}
					>
						<div
							className="h-full rounded-full bg-primary-500"
							style={{ width: `${Math.max((datum.value / max) * 100, 2)}%` }}
						/>
					</div>
				</li>
			))}
		</ul>
	);
}
