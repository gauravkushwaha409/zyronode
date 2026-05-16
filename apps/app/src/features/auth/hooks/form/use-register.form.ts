import { useAppForm } from "@package/react-hook-form";
import { registerSchema, type RegisterSchema } from "../../schema";
// here use the useAppForm to collect the data which was in the store of the rhf.

export function useRegisterForm() {
  const form = useAppForm<RegisterSchema>({
    // Providing the whole form data to the schema for validation.
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
