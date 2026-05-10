import { RhfInput } from "@packages/react-hook-form";
import { Button } from "@packages/ui";

export function RegisterForm() {
    return(
        <div className="space-y-5">
            <RhfInput name="firstName" label="First Name" />
            <RhfInput name="lastName" label="Last Name" />
            <RhfInput name="email" label="Email" />
            <RhfInput name="password" label="Password" />

            <div>
                <Button type="submit">
                    Register
                </Button>
            </div>
        </div>
    )
}