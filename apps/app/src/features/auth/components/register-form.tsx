import { RhfInput } from "@packages/react-hook-form";

export function RegisterForm() {
    return(
        <div className="space-y-5">
            <RhfInput name="email" label="Email" />
            <RhfInput name="password" label="Password" />
        </div>
    )
}