import { Turnstile } from "@marsidev/react-turnstile";
import { RhfInput } from "@package/react-hook-form";
import { Button } from "@package/ui";

export function LoginForm({handleTurnstileSuccess}: {
  handleTurnstileSuccess: (token: string) => void
}) {
  return (
    <div className="space-y-5">
      <RhfInput name="email" label="Email" type="email" />
      <RhfInput name="password" label="Password" type="password" />

      <Turnstile onSuccess={handleTurnstileSuccess} siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY} />

      <div className="mt-10">
        <Button>Submit</Button>
      </div>
    </div>
  );
}
