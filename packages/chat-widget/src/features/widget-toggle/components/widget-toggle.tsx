import { Button } from "@package/ui";

interface WidgetToggleProps {
	onClick: () => void;
	unreadCount?: number;
}

export function WidgetToggle({ onClick, unreadCount = 0 }: WidgetToggleProps) {
	return (
		<section className="fixed bottom-6 right-6 z-[1000]">
			<Button
				type="button"
				onClick={onClick}
				className="relative h-14 w-14 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
				aria-label={
					unreadCount > 0 ? `Open chat, ${unreadCount} unread` : "Open chat"
				}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
				</svg>
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</Button>
		</section>
	);
}
