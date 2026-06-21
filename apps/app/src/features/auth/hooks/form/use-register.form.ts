import { useForm } from "@package/form";
import { registerSchema, type RegisterSchema } from "../../schema";

export function useRegisterForm() {
  const form = useForm<RegisterSchema>({
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
