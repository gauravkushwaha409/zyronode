import type React from "react";
import { useMeQuery } from "../hooks";

export function AuthGaurd({children}: {children: React.ReactNode}){
    const user = useMeQuery();

    if(user?.status === 'success') return <>{children}</>;
    return null;
}

export function redirectAuthenticatedUserToApp() {
    const user = useMeQuery();
    const currentOrganization = user?.data?.data?.data?.lastOrgId;
    const userId = user?.data?.data?.data?.id;

    if (userId && currentOrganization) {
        window.location.href = `/${currentOrganization}/dashboard`;
    }
}
