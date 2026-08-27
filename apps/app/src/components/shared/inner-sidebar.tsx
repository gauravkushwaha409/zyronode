import type { IconName } from "@package/icons";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Icon,
	Typography,
} from "@package/ui";
import {
	Link,
	type LinkProps,
	useMatchRoute,
	useRouterState,
} from "@tanstack/react-router";
import type React from "react";

/** Typed against the generated route tree so `params` can be inferred. */
type SidebarHref = LinkProps["to"];

export interface SidebarItem {
	label: string;
	href: SidebarHref;
}

export type InnerSidebarData =
	| {
			title: string;
			items: SidebarItem[];
			icon: IconName;
	  }
	| {
			title: string;
			href: SidebarHref;
			icon: IconName;
	  };

interface InnerSidebarProps {
	pageHeader: React.ReactNode;
	data: InnerSidebarData[];
}

export function InnerSidebar({ pageHeader, data }: InnerSidebarProps) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const organizationId = pathname.split("/").filter(Boolean)[1] ?? "";
	const matchRoute = useMatchRoute();

	const open = data.find((section) => {
		if (!("items" in section)) return false;
		return section.items.some((item) =>
			matchRoute({ to: item.href, fuzzy: true }),
		);
	})?.title;

	/**
	 * `to` arrives as data, so it is a union of route paths rather than a
	 * literal - TanStack then cannot infer which route's params apply and
	 * rejects `params` outright. Every href in this sidebar is an
	 * `/$organization/...` route, so assert once here instead of widening
	 * `href` back to `any`.
	 */
	const routeProps = (href: SidebarHref) =>
		({
			to: href,
			params: { organization: organizationId },
		}) as LinkProps;

	return (
		<aside className="w-fit h-full shrink-0 border-r border-gray-200 bg-white shrink-0">
			<div className="h-14 px-4 border-b border-gray-200 flex items-center">
				<Typography.T2 weight="semibold" className="text-gray-950">
					{pageHeader}
				</Typography.T2>
			</div>
			<div className="p-3">
				<Accordion type="single" defaultValue={open ?? ""} collapsible>
					{data.map((section) => {
						if ("items" in section) {
							return (
								<AccordionItem key={section.title} value={section.title}>
									<AccordionTrigger className="typo-t3 gap-2.5 px-3 font-medium h-9">
										<Icon name={section.icon} size={20} className="text-gray-950" />{" "}
										{section.title}
									</AccordionTrigger>
									<AccordionContent>
										<div className="flex flex-col gap-1 px-3 py-1.5">
											{section.items.map((item) => (
												<Link
													activeOptions={{ exact: false }}
													key={item.href}
													{...routeProps(item.href)}
													className="px-3 h-9 flex items-center border border-transparent rounded-[6px] typo-t3 font-medium hover:bg-gray-100"
													activeProps={{
														className:
															"border-primary-200! text-primary-500 shadow-[0_2px_5px_0_rgba(0,0,0,0.05)] hover:bg-transparent",
													}}
												>
													{item.label}
												</Link>
											))}
										</div>
									</AccordionContent>
								</AccordionItem>
							);
						}
						return (
							<Link
								key={section.href}
								{...routeProps(section.href)}
								activeOptions={{ exact: false }}
								className="h-9 my-px px-3 border border-transparent flex items-center typo-t3 text-gray-800 font-medium gap-2.5 rounded-[6px] hover:bg-gray-100"
								activeProps={{
									className:
										"border-primary-200! text-primary-500 shadow-[0_2px_5px_0_rgba(0,0,0,0.05)] hover:bg-transparent",
								}}
							>
								{({ isActive }) => (
									<>
										<Icon
											name={section.icon}
											size={20}
											className={isActive ? "text-primary-500" : "text-gray-950"}
										/>
										{section.title}
									</>
								)}
							</Link>
						);
					})}
				</Accordion>
			</div>
		</aside>
	);
}
