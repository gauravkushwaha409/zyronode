import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionHeader, Button, Label, Typography, Badge, DialogWrapper } from "@package/ui";
import { FormWrapper, FormPassword } from "@package/form";
import { useForm } from "@package/form";
import { z } from "zod";
import { useMeQuery } from "@/features/auth/hooks";
import { useState } from "react";

export const Route = createFileRoute("/_organization-protected/$organization/settings/account-settings/security")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isPending } = useMeQuery();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [dialog, setDialog] = useState<null | "password" | "enable-mfa" | "disable-mfa" | "revoke" | "revoke-all">(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  if (isPending) {
    return (
      <section className="pt-6">
        <PageHeader title="Account Security" description="Manage your password, MFA, active sessions, and other security preferences." className="px-11" />
        <div className="px-11 pt-6 animate-pulse h-32 bg-gray-50 rounded" />
      </section>
    );
  }

  const user = data?.data.data;
  const lastChanged = user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <section className="pt-6">
      <PageHeader title="Account Security" description="Manage your password, MFA, active sessions, and other security preferences." className="px-11" />

      <section className="flex-1 min-w-0 px-11">
        <section className="grid grid-cols-2 gap-8 mt-9 mb-6 border-b pb-6">
          {/* Password — mirrors portal PasswordSection */}
          <section>
            <SectionHeader
              heading="Password"
              description="Update your chatboq password to make it more secured"
              tooltipPrimaryText="For security purposes, you’ll be required to update your password every 90 days to help keep your account protected."
              tooltipSecondaryText="Password Expiry Policy"
              showIcon
              className="mb-5"
            />
            <div className="flex gap-4">
              <Button size="sm" variant="alert" onClick={() => setDialog("password")} className="w-fit">Change Password</Button>
              {lastChanged && (
                <span className="flex flex-col gap-0.5">
                  <Typography.T5 weight="regular" className="text-gray-500">Last Changed</Typography.T5>
                  <Typography.T5 weight="medium" className="text-gray-950">{lastChanged}</Typography.T5>
                </span>
              )}
            </div>
          </section>

          {/* MFA — mirrors portal MFASection */}
          <section>
            <SectionHeader
              heading="Multi Factor Authentication (MFA)"
              description="Add an extra layer of security to your account by enabling MFA"
              className="mb-5"
              showIcon
              tooltipSecondaryText="Multi-Factor Authentication (MFA)"
              tooltipPrimaryText="MFA helps protect your account by requiring a verification code from your authenticator app in addition to your password when you sign in."
              tooltipPlacement="top-right"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={mfaEnabled}
                onClick={() => setDialog(mfaEnabled ? "disable-mfa" : "enable-mfa")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${mfaEnabled ? "bg-primary-500" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mfaEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <Label className="text-gray-950 font-medium typo-t3">Enable MFA</Label>
            </div>
            <Typography.T5 weight="regular" className="text-gray-500 mt-5">{mfaEnabled ? "Enabled" : "Not Enabled"}</Typography.T5>
          </section>
        </section>

        {/* Sessions — mirrors portal SessionsSection */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <SectionHeader
              showIcon
              heading="Recent login sessions history"
              description="Verify and manage your login session here to avoid unrecognized logins"
              tooltipPrimaryText="If this session looks suspicious, we strongly recommend updating your password immediately and enabling MFA for added account security."
              tooltipSecondaryText="Found Suspicious?"
            />
            <Button className="w-fit" size="xs" variant="secondary" rightIcon="logout" onClick={() => setDialog("revoke-all")}>Revoke All</Button>
          </div>
          <div className="pb-6 min-w-0 rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Device</th>
                  <th className="text-left font-medium px-4 py-2.5">Location</th>
                  <th className="text-left font-medium px-4 py-2.5">Last active</th>
                  <th className="text-left font-medium px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { id: "current", device: "Current session — This device", location: "—", active: "Now", current: true },
                  { id: "s2", device: "Chrome on macOS", location: "Mumbai, IN", active: "2 hours ago" },
                  { id: "s3", device: "Safari on iPhone", location: "Delhi, IN", active: "Yesterday" },
                ].map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-2"><span className="typo-t3 font-medium">{s.device}</span>{s.current && <Badge variant="secondary" className="text-[11px]">Current</Badge>}</td>
                    <td className="px-4 py-3 text-gray-600">{s.location}</td>
                    <td className="px-4 py-3 text-gray-600">{s.active}</td>
                    <td className="px-4 py-3 text-right">
                      {!s.current && (
                        <Button variant="ghost" size="xs" onClick={() => { setSelectedSession(s.id); setDialog("revoke"); }}>Revoke</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {/* Dialogs — lightweight mirrors of portal SecurityDialogs */}
      <DialogWrapper open={dialog === "password"} onOpenChange={(o: boolean) => !o && setDialog(null)} title="Change Password" description="Update your password">
        <ChangePasswordForm onClose={() => setDialog(null)} />
      </DialogWrapper>
      <DialogWrapper open={dialog === "enable-mfa"} onOpenChange={(o: boolean) => !o && setDialog(null)} title="Enable MFA" description="Confirm enabling MFA">
        <div className="space-y-4"><Typography.T4 className="text-gray-600">Scan the QR code in your authenticator app and enter the 6-digit code to enable MFA.</Typography.T4><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={() => { setMfaEnabled(true); setDialog(null); }}>Confirm</Button></div></div>
      </DialogWrapper>
      <DialogWrapper open={dialog === "disable-mfa"} onOpenChange={(o: boolean) => !o && setDialog(null)} title="Disable MFA" description="Confirm disabling MFA">
        <div className="space-y-4"><Typography.T4 className="text-gray-600">Are you sure you want to disable Multi Factor Authentication?</Typography.T4><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button variant="alert" onClick={() => { setMfaEnabled(false); setDialog(null); }}>Disable</Button></div></div>
      </DialogWrapper>
      <DialogWrapper open={dialog === "revoke"} onOpenChange={(o: boolean) => !o && setDialog(null)} title="Revoke Session" description={`Revoke session ${selectedSession}?`}>
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button variant="alert" onClick={() => setDialog(null)}>Revoke</Button></div>
      </DialogWrapper>
      <DialogWrapper open={dialog === "revoke-all"} onOpenChange={(o: boolean) => !o && setDialog(null)} title="Revoke All Sessions" description="This will sign you out from all other devices.">
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button variant="alert" onClick={() => setDialog(null)}>Revoke All</Button></div>
      </DialogWrapper>
    </section>
  );
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(1),
}).refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const form = useForm<z.infer<typeof passwordSchema>>({ schema: passwordSchema, defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });
  const onSubmit = form.handleSubmit(() => onClose());
  return (
    <FormWrapper useFormMethods={form} formProps={{ onSubmit }}>
      <div className="space-y-4">
        <FormPassword name="currentPassword" label="Current Password" />
        <FormPassword name="newPassword" label="New Password" />
        <FormPassword name="confirmPassword" label="Confirm Password" />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>Change Password</Button>
        </div>
      </div>
    </FormWrapper>
  );
}
