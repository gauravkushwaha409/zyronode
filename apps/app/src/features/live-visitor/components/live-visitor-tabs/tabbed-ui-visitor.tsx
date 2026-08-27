import type { IconName } from "@package/icons";
import { cn, Icon, Typography } from "@package/ui";
import { useState } from "react";
import { useVisitorPanelsStore } from "../../store";
import { AgentChat } from "./agent-chat";
import { GeoIp } from "./geo-ip";
import { Overview } from "./overview";

type VisitorTabId = "overview" | "geo-ip" | "agent-chat";

const TABS: Array<{ id: VisitorTabId; label: string; icon: IconName }> = [
	{ id: "overview", label: "Overview", icon: "list-view" },
	{ id: "geo-ip", label: "Geo / IP", icon: "location" },
	{ id: "agent-chat", label: "Agent chat", icon: "all-conversation" },
];

interface TabbedUIVisitorProps {
	organizationId: string;
}

export function TabbedUIVisitor({ organizationId }: TabbedUIVisitorProps) {
	const [currentTab, setCurrentTab] = useState<VisitorTabId>("overview");
	// the chat tab follows whichever visitor the drawer was last opened for
	const drawerVisitorId = useVisitorPanelsStore((s) => s.drawerVisitorId);

	return (
		<div className="flex flex-col gap-4">
			<div
				role="tablist"
				aria-label="Live visitor views"
				className="flex w-fit items-center gap-1 rounded-[8px] border border-gray-border-200 bg-gray-fill-50 p-1"
			>
				{TABS.map((tab) => {
					const isSelected = tab.id === currentTab;
					return (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={isSelected}
							onClick={() => setCurrentTab(tab.id)}
							className={cn(
								"flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] px-3 transition-colors",
								isSelected
									? "bg-white-base text-primary-500 shadow-sm"
									: "text-gray-600 hover:text-gray-800",
							)}
						>
							<Icon name={tab.icon} size={14} />
							<Typography.T4 weight="medium">{tab.label}</Typography.T4>
						</button>
					);
				})}
			</div>

			{currentTab === "overview" && <Overview organizationId={organizationId} />}
			{currentTab === "geo-ip" && <GeoIp organizationId={organizationId} />}
			{currentTab === "agent-chat" && (
				<AgentChat organizationId={organizationId} visitorId={drawerVisitorId} />
			)}
		</div>
	);
}
