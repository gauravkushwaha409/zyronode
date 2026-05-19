import { useAppForm } from "@package/react-hook-form";
import { registerSchema, type RegisterSchema } from "../../schema";
// here use the useAppForm to collect the data which was in the store of the rhf.

export function useRegisterForm() {
  const form = useAppForm<RegisterSchema>({
    // Providing the whole form data to the schema for validation. Here we are providing the default values so that the context can know which value is being used for the particular form.
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    schema: registerSchema,
  });

  return { form };
}
