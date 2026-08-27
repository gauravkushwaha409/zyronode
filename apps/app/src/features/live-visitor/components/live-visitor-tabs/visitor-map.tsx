import { EmptyState } from "@package/ui";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { VisitorListItem } from "../../types";
import { visitorDisplayName, visitorLocation } from "../../utility";
import "leaflet/dist/leaflet.css";

interface VisitorMapProps {
	visitors: VisitorListItem[];
}

/**
 * Uses CircleMarker rather than the default Leaflet Marker so no external
 * marker-icon PNG has to be resolved through the bundler.
 */
export function VisitorMap({ visitors }: VisitorMapProps) {
	const located = visitors.filter(
		(visitor) => visitor.latitude !== null && visitor.longitude !== null,
	);

	if (located.length === 0) {
		return (
			<EmptyState
				size="sm"
				icon="location"
				title="No location data"
				description="Visitor coordinates appear once geo-IP lookup has run."
			/>
		);
	}

	return (
		<div className="h-80 overflow-hidden rounded-[10px] border border-gray-border-200">
			<MapContainer
				center={[20, 10]}
				zoom={1}
				scrollWheelZoom={false}
				className="h-full w-full"
				worldCopyJump
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{located.map((visitor) => (
					<CircleMarker
						key={visitor.id}
						center={[visitor.latitude as number, visitor.longitude as number]}
						radius={6}
						pathOptions={{
							color: "#ffffff",
							weight: 2,
							fillColor: visitor.isOnline ? "#17b26a" : "#7c3aed",
							fillOpacity: 1,
						}}
					>
						<Popup>
							<div className="flex flex-col gap-0.5">
								<span className="font-medium">{visitorDisplayName(visitor)}</span>
								<span>{visitorLocation(visitor)}</span>
								{visitor.currentPage && <span>{visitor.currentPage}</span>}
								<span>{visitor.isOnline ? "Online" : "Offline"}</span>
							</div>
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>
		</div>
	);
}
