import { useForm } from "@package/react-hook-form";
import { registerSchema, type RegisterSchema } from "../../schema";

export function useRegisterForm() {
<<<<<<< HEAD
  const form = useAppForm<RegisterSchema>({
    // Providing the whole form data to the schema for validation. Here we are providing the default values so that the context can know which value is being used for the particular form.
=======
  const form = useForm<RegisterSchema>({
>>>>>>> aa0ae39436f94f403c27c3fac8ca0f288e951f80
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
