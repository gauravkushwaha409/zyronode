import { AppFormWrapper } from "@packages/react-hook-form";
import { LoginForm } from "./login-form";
import { useLoginForm } from "../hooks";

export function LoginMutation() {
    const loginForm = useLoginForm()
    return (
        <AppFormWrapper useFormMethods={loginForm.form}>
            <LoginForm />
        </AppFormWrapper>
    )
}