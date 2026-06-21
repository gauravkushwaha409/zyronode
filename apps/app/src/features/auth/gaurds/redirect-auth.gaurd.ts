import { redirect } from "@tanstack/react-router";

export function redirectAuthenticatedUserToApp(
  user: { data?: { data?: { id?: string; lastOrgId?: string | null } } } | undefined,
) {
  if (user?.data?.data?.lastOrgId) {
    throw redirect({
      to: "/$organization/dashboard",
      params: {
        organization: user?.data?.data?.lastOrgId,
      },
    });
  }

  if (user?.data?.data?.id) {
    throw redirect({
      to: "/select-organization",
    });
  }
}
