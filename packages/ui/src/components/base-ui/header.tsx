"use client"

import * as React from "react"
import { cn } from "#lib/utils"

function Header({
	className,
	children,
	...props
}: React.ComponentProps<"header">) {
	return (
		<header
			data-slot="header"
			className={cn("flex items-center justify-between px-5 pb-2.5", className)}
			{...props}
		>
			{children}
		</header>
	)
}

function HeaderLeft({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="header-left"
			className={cn("flex items-center gap-2", className)}
			{...props}
		>
			{children}
		</div>
	)
}

function HeaderCenter({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="header-center"
			className={cn("flex items-center", className)}
			{...props}
		>
			{children}
		</div>
	)
}

function HeaderRight({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="header-right"
			className={cn("flex items-center gap-2", className)}
			{...props}
		>
			{children}
		</div>
	)
}

export { Header, HeaderCenter, HeaderLeft, HeaderRight }
