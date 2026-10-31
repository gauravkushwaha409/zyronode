import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/pages/admin-page";

export const Route = createFileRoute("/_shell/users")({
	component: UsersPage,
});

function UsersPage() {
	return (
		<AdminPage title="Users" description="Browse and manage platform users." />
	);
}
