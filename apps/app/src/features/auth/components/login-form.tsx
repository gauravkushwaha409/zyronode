import { RhfInput } from "@package/react-hook-form";
import { Button } from "@package/ui";

export function LoginForm() {
    return(
        <div className="space-y-5">
            <RhfInput name="email" label="Email" type="email" />
            <RhfInput name="password" label="Password" type="password" />

            <div className="mt-10">
                <Button>Submit</Button>
            </div>
        
        </div>
    )
}