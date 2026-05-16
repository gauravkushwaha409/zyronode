import { RhfInput } from "@package/react-hook-form";
import { Button } from "@package/ui";

export function RegisterForm() {
  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl border bg-background p-6 shadow-sm">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Account
        </h1>

        <p className="text-sm text-muted-foreground">
          Enter your information to create your account
        </p>
      </div>

      <div className="gap-4">
        <RhfInput name="firstName" label="First Name" placeholder="John" />

        <RhfInput name="lastName" label="Last Name" placeholder="Doe" />
      </div>

      <RhfInput
        name="email"
        label="Email"
        type="email"
        placeholder="john@example.com"
      />

      <RhfInput
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
      />

      <RhfInput
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
      />

      <Button type="submit" className="w-full">
        Create Account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <span className="cursor-pointer font-medium text-foreground hover:underline">
          Sign in
        </span>
      </p>
    </div>
  );
}
