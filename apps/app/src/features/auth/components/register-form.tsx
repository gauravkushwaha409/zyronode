import { FormInput } from "@package/react-hook-form";
import { Button } from "@package/ui";

export function RegisterForm() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormInput name="firstName" label="First Name" placeholder="John" />
        <FormInput name="lastName" label="Last Name" placeholder="Doe" />
      </div>

      <FormInput
        name="email"
        label="Email"
        placeholder="john@example.com"
      />

      <FormInput
        name="password"
        label="Password"
        placeholder="Enter your password"
      />

      <FormInput
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter your password"
      />

      <div className="mt-8">
        <Button type="submit" className="w-full h-11 text-base font-medium">
          Create Account
        </Button>
      </div>
    </div>
  );
}
