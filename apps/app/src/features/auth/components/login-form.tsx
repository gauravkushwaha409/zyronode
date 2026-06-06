import { Turnstile } from "@marsidev/react-turnstile";
import { FormInput } from "@package/react-hook-form";
import { Button } from "@package/ui";

export function LoginForm({handleTurnstileSuccess}: {
  handleTurnstileSuccess: (token: string) => void
}) {
  return (
    <div className="space-y-5">
      <FormInput name="email" label="Email"  />
      <FormInput name="password" inputProps={{type: 'password'}} label="Password"  />

      <div className="flex justify-center mt-2">
        <Turnstile onSuccess={handleTurnstileSuccess} siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY} />
      </div>

      <div className="mt-8">
        <Button className="w-full h-11 text-base font-medium">Sign in</Button>
      </div>
    </div>
  );
}
