import { Avatar, cn, Icon, Typography } from "@package/ui";
import { useQueryClient } from "@package/query";
import { useNavigate } from "@tanstack/react-router";
import {
	useAdminLogoutMutation,
	useAdminMeQuery,
} from "@/features/auth/hooks/use-admin-auth";

interface SidebarFooterProps {
	open: boolean;
}

export function SidebarFooter({ open }: SidebarFooterProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data } = useAdminMeQuery();
	const logoutMutation = useAdminLogoutMutation();
	const user = data?.data?.data?.user;

	const fullName =
		[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
		user?.email ||
		"Admin";

	async function handleLogout() {
		try {
			await logoutMutation.mutateAsync();
		} catch {
			return;
		}

		queryClient.clear();
		navigate({ to: "/auth/login", replace: true });
	}

	return (
		<section className="px-3 shrink-0">
			<div className="flex w-full items-center gap-3 rounded-[6px] p-1 -m-1">
				<Avatar
					size="xl"
					fallbackText={fullName}
					className="bg-primary-100 text-primary-600"
				/>
				<section
					className={cn(
						"flex flex-1 items-center gap-1 overflow-hidden whitespace-nowrap",
						open ? "max-w-40 opacity-100" : "max-w-0 opacity-0",
					)}
				>
					<div className="flex-1 flex flex-col text-start overflow-hidden">
						<Typography.T3
							weight="medium"
							className="text-gray-950 truncate max-w-32"
						>
							{fullName}
						</Typography.T3>
						<Typography.T5
							weight="regular"
							className="text-gray-400 truncate max-w-32"
						>
							{user?.platformRole?.replace("_", " ") ?? "Administrator"}
						</Typography.T5>
					</div>
					<button
						type="button"
						onClick={handleLogout}
						disabled={logoutMutation.isPending}
						aria-label="Log out"
						title="Log out"
						className="flex size-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
					>
						<Icon name="logout" size={18} />
					</button>
				</section>
			</div>
		</section>
	);
}
