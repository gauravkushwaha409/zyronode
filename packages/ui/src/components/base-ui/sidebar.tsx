"use client"

import * as React from "react"
import { cn } from "#lib/utils"

const SIDEBAR_WIDTH = "220px"
const SIDEBAR_WIDTH_ICON = "68px"

interface SidebarContextValue {
	open: boolean
	collapsed: boolean
	hovered: boolean
	setCollapsed: (collapsed: boolean) => void
	setHovered: (hovered: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
	const ctx = React.useContext(SidebarContext)
	if (!ctx) throw new Error("useSidebar must be used within <Sidebar />")
	return ctx
}

function Sidebar({
	className,
	defaultCollapsed = true,
	children,
	...props
}: React.ComponentProps<"section"> & {
	defaultCollapsed?: boolean
}) {
	const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
	const [hovered, setHovered] = React.useState(false)

	const open = !collapsed || hovered
	const isFloating = collapsed && hovered

	return (
		<SidebarContext.Provider
			value={{ open, collapsed, hovered, setCollapsed, setHovered }}
		>
			<section
				style={{ width: collapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH }}
				className={cn(
					"relative shrink-0 transition-[width] duration-300 ease-in-out h-full",
					className,
				)}
				onMouseEnter={() => { if (collapsed) setHovered(true) }}
				onMouseLeave={() => { if (collapsed) setHovered(false) }}
				{...props}
			>
				<div
					style={{ width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON }}
					className={cn(
						"flex flex-col h-full py-3 justify-between overflow-hidden transition-[width] duration-300 ease-in-out",
						isFloating && "absolute inset-y-0 left-0 z-50 bg-white-base border-r border-gray-border-200",
					)}
				>
					{children}
				</div>
			</section>
		</SidebarContext.Provider>
	)
}

function SidebarHeader({
	className,
	children,
	...props
}: React.ComponentProps<"section">) {
	return (
		<section
			data-slot="sidebar-header"
			className={cn("px-3", className)}
			{...props}
		>
			{children}
		</section>
	)
}

function SidebarContent({
	className,
	children,
	...props
}: React.ComponentProps<"section">) {
	return (
		<section
			data-slot="sidebar-content"
			className={cn(
				"flex-1 px-3 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-gray-300 scrollbar-track-transparent",
				className,
			)}
			{...props}
		>
			{children}
		</section>
	)
}

function SidebarFooter({
	className,
	children,
	...props
}: React.ComponentProps<"section">) {
	return (
		<section
			data-slot="sidebar-footer"
			className={cn("px-3 shrink-0 flex flex-col gap-3", className)}
			{...props}
		>
			{children}
		</section>
	)
}

interface SidebarNavLinkProps extends React.ComponentProps<"a"> {
	icon?: React.ReactNode
	active?: boolean
}

function SidebarNavLink({
	className,
	icon,
	children,
	active,
	...props
}: SidebarNavLinkProps) {
	const { open } = useSidebar()

	return (
		<a
			data-active={active ? "" : undefined}
			className={cn(
				"relative h-9 flex items-center rounded-[6px] border border-transparent px-2.5 gap-2 typo-t3 font-medium transition-all duration-150 no-underline cursor-pointer",
				"text-gray-800 hover:text-primary-500 hover:bg-gray-fill-50",
				active && "border-primary-200 bg-white-base text-primary-500 shadow-[0_4px_10px_hsla(0,0%,0%,0.05)]",
				!open && "px-2 gap-0 justify-center",
				className,
			)}
			{...props}
		>
			{icon && (
				<span className={cn(
					"shrink-0 [&>svg]:size-5 text-gray-950 transition-colors duration-150",
					active && "text-primary-500",
				)}>
					{icon}
				</span>
			)}
			<span
				className={cn(
					"overflow-hidden whitespace-nowrap transition-all duration-300",
					open ? "max-w-40 opacity-100" : "max-w-0 opacity-0",
				)}
			>
				{children}
			</span>
		</a>
	)
}

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarNavLink,
	useSidebar,
}
