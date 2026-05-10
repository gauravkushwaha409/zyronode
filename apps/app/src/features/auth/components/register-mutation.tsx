import { AppFormWrapper } from "@packages/react-hook-form";
import { RegisterForm } from "./register-form";
import { useRegisterForm } from "../hooks";

export function RegisterMutation() {
    const registerForm = useRegisterForm()
    return (
        <AppFormWrapper useFormMethods={registerForm.form}>
            <RegisterForm />
        </AppFormWrapper>
    )
}