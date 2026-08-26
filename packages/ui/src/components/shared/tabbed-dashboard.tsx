import type { IconName } from "@package/icons";

export interface TabButtonProps<TabId extends string> {
	tabId: TabId;
	label: string;
	icon?: IconName;
	isSelected: boolean;
	onClick: () => void;
	className?: string;
}

type ContainerProps = Pick<React.ComponentPropsWithoutRef<"div">, "className">;

export interface TabbedDashboardApi<TabId extends string> {
	tabs: Array<{ id: TabId; label: string; icon?: IconName; content: React.ComponentType }>;
	currentTabId: TabId;
	onChange: (id: TabId) => void;
}

interface TabbedDashboardProps<TabId extends string> extends ContainerProps {
	dashboard: TabbedDashboardApi<TabId>;
	TabButton?: React.ComponentType<TabButtonProps<TabId>>;
	render?: "tabs" | "content" | "both";
	tabWrapperProps?: Pick<React.ComponentPropsWithoutRef<"div">, "className">;
	contentWrapperProps?: React.ComponentPropsWithoutRef<"div">;
	tabButtonProps?: Pick<TabButtonProps<TabId>, "className">;
}
export function TabbedDashboard<TabId extends string>({
	dashboard,
	TabButton,
	render = "both",
	tabButtonProps,
	tabWrapperProps,
	contentWrapperProps,
	...rest
}: TabbedDashboardProps<TabId>) {
	const { tabs, currentTabId, onChange } = dashboard;
	const currentTab = tabs.find((tab) => tab.id === currentTabId);
	return (
		<div {...rest}>
			{render !== "content" && TabButton && (
				<div {...tabWrapperProps}>
					{tabs.map((tab) => (
						<TabButton
							key={tab.id}
							tabId={tab.id}
							label={tab.label}
							{...(tab.icon ? { icon: tab.icon } : {})}
							isSelected={tab.id === currentTabId}
							onClick={() => onChange(tab.id)}
							{...(tabButtonProps?.className ? { className: tabButtonProps.className } : {})}
						/>
					))}
				</div>
			)}
			{render !== "tabs" && <div {...contentWrapperProps}>{currentTab && <currentTab.content />}</div>}
		</div>
	);
}
