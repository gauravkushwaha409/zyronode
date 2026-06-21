import * as React from "react";
interface SidebarContextValue {
    open: boolean;
    collapsed: boolean;
    hovered: boolean;
    setCollapsed: (collapsed: boolean) => void;
    setHovered: (hovered: boolean) => void;
}
declare function useSidebar(): SidebarContextValue;
declare function Sidebar({ className, defaultCollapsed, children, ...props }: React.ComponentProps<"section"> & {
    defaultCollapsed?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare function SidebarHeader({ className, children, ...props }: React.ComponentProps<"section">): import("react/jsx-runtime").JSX.Element;
declare function SidebarContent({ className, children, ...props }: React.ComponentProps<"section">): import("react/jsx-runtime").JSX.Element;
declare function SidebarFooter({ className, children, ...props }: React.ComponentProps<"section">): import("react/jsx-runtime").JSX.Element;
interface SidebarNavLinkProps extends React.ComponentProps<"a"> {
    icon?: React.ReactNode;
    active?: boolean;
}
declare function SidebarNavLink({ className, icon, children, active, ...props }: SidebarNavLinkProps): import("react/jsx-runtime").JSX.Element;
export { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarNavLink, useSidebar, };
