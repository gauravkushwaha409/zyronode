import { useMeQuery } from "@/features/auth/hooks"

export function RootPage(){
    useMeQuery()
    return(
        <div>
            root page
        </div>
    )
}