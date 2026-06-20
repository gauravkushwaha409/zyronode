import {
	cn,
	Header,
	HeaderLeft,
	HeaderRight,
	Input,
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarNavLink,
	useSidebar,
} from "@package/ui";
import {
	createFileRoute,
	Outlet,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";

function DashboardIcon() {
	return (
		<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
			/>
		</svg>
	);
}

function InboxIcon() {
	return (
		<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3"
			/>
		</svg>
	);
}

function TicketIcon() {
	return (
		<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-6.75-3.75a2.25 2.25 0 0 0-2.25 2.25m2.25-4.5a2.25 2.25 0 0 1 2.25 2.25m0 0a2.25 2.25 0 0 0 2.25 2.25m-2.25 0a2.25 2.25 0 0 1-2.25 2.25m0 0a2.25 2.25 0 0 0 2.25 2.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
			/>
		</svg>
	);
}

function VisitorIcon() {
	return (
		<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
			/>
		</svg>
	);
}

function SearchIcon() {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="size-4"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
			/>
		</svg>
	);
}

function PinIcon() {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="size-4.5"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
			/>
		</svg>
	);
}

function SidebarCloseIcon() {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="size-4.5"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
			/>
		</svg>
	);
}

function LogoutIcon() {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="size-4"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
			/>
		</svg>
	);
}

const NAV_ITEMS = [
	{
		label: "Dashboard",
		icon: <DashboardIcon />,
		to: "/$organization/dashboard",
	},
	{ label: "Inbox", icon: <InboxIcon />, to: "/$organization/inbox" },
	{ label: "Tickets", icon: <TicketIcon />, to: "/$organization/ticket" },
	{ label: "Visitors", icon: <VisitorIcon />, to: "/$organization/visitor" },
] as const;

export const Route = createFileRoute("/_organization-protected/$organization")({
	component: RouteComponent,
});

function SidebarLogo({ open }: { open: boolean }) {
	return (
		<div className="flex items-center gap-2.5 px-0.5">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-[6px] bg-linear-to-t from-primary-950 to-primary-500 text-white text-sm font-bold shadow-sm">
				C
			</div>
			<span
				className={cn(
					"overflow-hidden whitespace-nowrap typo-t3 font-semibold text-gray-950 transition-all duration-300",
					open ? "max-w-40 opacity-100" : "max-w-0 opacity-0",
				)}
			>
				Chat App
			</span>
		</div>
	);
}

function SidebarInner() {
	const router = useRouter();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { organization } = Route.useParams();
	const { open, collapsed, hovered, setCollapsed, setHovered } = useSidebar();

	return (
		<>
			<SidebarHeader>
				<div className="flex items-center justify-between gap-1">
					<SidebarLogo open={open} />
					<div className="flex items-center gap-1 shrink-0">
						{hovered && collapsed && (
							<button
								type="button"
								className="flex size-5 items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
								onClick={() => {
									setCollapsed(false);
									setHovered(false);
								}}
								title="Pin sidebar"
							>
								<PinIcon />
							</button>
						)}
						{!collapsed && (
							<button
								type="button"
								className="flex size-5 items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
								onClick={() => setCollapsed(true)}
								title="Collapse sidebar"
							>
								<SidebarCloseIcon />
							</button>
						)}
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				{NAV_ITEMS.map((item) => {
					const href = `/${organization}${item.to.replace("/$organization", "")}`;
					const active = pathname === href;
					return (
						<SidebarNavLink
							key={item.to}
							icon={item.icon}
							href={href}
							active={active}
						>
							{item.label}
						</SidebarNavLink>
					);
				})}
			</SidebarContent>

			<SidebarFooter>
				<div className="border-t border-gray-border-100 pt-3">
					<SidebarNavLink
						icon={<LogoutIcon />}
						onClick={() => router.navigate({ to: "/login" })}
					>
						Logout
					</SidebarNavLink>
				</div>
			</SidebarFooter>
		</>
	);
}

function RouteComponent() {

	return (
		<section className="flex h-screen overflow-hidden bg-gray-50">
			<Sidebar>
				<SidebarInner />
			</Sidebar>

			<section className="flex flex-1 flex-col py-2.5 min-w-0">
				<Header>
					<HeaderLeft>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
								<SearchIcon />
							</div>
							<Input
								placeholder="Quick Search"
								className="w-120 pl-10 bg-white-base border-gray-border-100 rounded-lg placeholder:text-gray-400"
							/>
						</div>
					</HeaderLeft>
					<HeaderRight>
						<button
							type="button"
							className="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-fill-50 transition-colors"
						>
							<svg
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
								/>
							</svg>
						</button>
					</HeaderRight>
				</Header>

				<div className="flex-1 bg-white-base rounded-l-[12px] overflow-hidden shadow-sm border border-gray-border-50">
					<Outlet />
				</div>
			</section>
		</section>
	);
}
