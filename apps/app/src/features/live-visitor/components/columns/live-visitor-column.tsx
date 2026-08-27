import type { VisitorListItem } from "../../types";
import {
	VisitorCurrentPageCell,
	VisitorDeviceCell,
	VisitorDurationCell,
	VisitorIdentityCell,
	VisitorLocationCell,
	VisitorStatusCell,
	VisitorVisitCountCell,
} from "./visitor-cells";

export interface VisitorColumn {
	id: string;
	header: string;
	/** Tailwind width class applied to both th and td. */
	className?: string;
	cell: (visitor: VisitorListItem) => React.ReactNode;
}

export const VISITOR_COLUMNS: VisitorColumn[] = [
	{
		id: "visitor",
		header: "Visitor",
		className: "min-w-56",
		cell: (visitor) => <VisitorIdentityCell visitor={visitor} />,
	},
	{
		id: "status",
		header: "Status",
		className: "w-28",
		cell: (visitor) => <VisitorStatusCell visitor={visitor} />,
	},
	{
		id: "location",
		header: "Location",
		className: "min-w-40",
		cell: (visitor) => <VisitorLocationCell visitor={visitor} />,
	},
	{
		id: "device",
		header: "Device",
		className: "min-w-36",
		cell: (visitor) => <VisitorDeviceCell visitor={visitor} />,
	},
	{
		id: "currentPage",
		header: "Current page",
		className: "min-w-40",
		cell: (visitor) => <VisitorCurrentPageCell visitor={visitor} />,
	},
	{
		id: "duration",
		header: "Active",
		className: "w-24",
		cell: (visitor) => <VisitorDurationCell visitor={visitor} />,
	},
	{
		id: "visits",
		header: "Visits",
		className: "w-20",
		cell: (visitor) => <VisitorVisitCountCell visitor={visitor} />,
	},
];
