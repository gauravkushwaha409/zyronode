import type React from "react";
import { useMeQuery } from "../hooks";

export function AuthGaurd({children}: {children: React.ReactNode}){
    const user = useMeQuery()

    if(user?.status === 'success') return <>{children}</>
    return null
}