import { FormWrapper } from "@package/react-hook-form";
import { RegisterForm } from "./register-form";
import { useRegisterForm, useRegisterMutation } from "../hooks";

export function RegisterMutation() {
  const registerForm = useRegisterForm();
  const registerMutation = useRegisterMutation();

  const handleSubmit = registerForm.form.handleSubmit(
    (data) => {
      console.log(data);
      registerMutation.mutate(data);
    },
    (error) => {
      console.log("on error ", error);
    },
  );
  return (
    <FormWrapper
      useFormMethods={registerForm.form}
      formProps={{ onSubmit: handleSubmit }}
    >
      <RegisterForm />
    </FormWrapper>
  );
}
