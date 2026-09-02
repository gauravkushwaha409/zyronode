import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Button, Avatar } from "@package/ui";
import { FormWrapper, FormInput } from "@package/form";
import { useForm } from "@package/form";
import { z } from "zod";
import { useMeQuery } from "@/features/auth/hooks";
import { useState } from "react";

const schema = z.object({
  avatar: z.string().optional(),
  fullName: z.string().min(1, "Required"),
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
  country: z.string().optional(),
  email: z.string().email().optional(),
});

export const Route = createFileRoute(
  "/_organization-protected/$organization/settings/account-settings/account-information",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isPending } = useMeQuery();
  const user = data?.data.data;
  const [preview, setPreview] = useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof schema>>({
    schema,
    defaultValues: { avatar: "", fullName: "", username: "", phoneNumber: "", country: "", email: "" },
    values: {
      avatar: preview ?? user?.profile ?? "",
      fullName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") ?? "",
      username: user?.email?.split("@")[0] ?? "",
      phoneNumber: "",
      country: "",
      email: user?.email ?? "",
    },
  });

  const isDirty = form.formState.isDirty;
  const handleSubmit = form.handleSubmit(
    () => {
      // TODO: wire to PATCH /auth/profile when backend supports avatar/phone/country
      form.reset(form.getValues());
    },
    (e) => console.error(e),
  );

  if (isPending) {
    return (
      <div className="pt-6 px-11">
        <PageHeader title="Account Information" description="Update your photo and other details here." />
        <div className="pt-9 animate-pulse space-y-4">
          <div className="h-20 w-20 rounded-full bg-gray-100" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const fallback = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <FormWrapper useFormMethods={form} formProps={{ onSubmit: handleSubmit }}>
      <div className="h-full flex flex-col overflow-hidden">
      <section className="pt-6 px-11 flex-1 overflow-y-auto">
        <PageHeader title="Account Information" description="Update your photo and other details here." />
        <section className="pb-6 pt-9">
          {/* Avatar upload — mirrors portal FormFileUpload */}
          <div className="flex items-center gap-4">
            <Avatar fallbackText={fallback} image={preview ?? user?.profile ?? undefined} size="2xl" />
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setPreview(url);
                    form.setValue("avatar", url, { shouldDirty: true });
                  }}
                />
                <span className="inline-flex h-9 items-center rounded-md border border-gray-200 bg-white px-4 text-sm font-medium hover:bg-gray-50">
                  Replace Image
                </span>
              </label>
              {preview && (
                <Button variant="ghost" size="sm" onClick={() => { setPreview(undefined); form.setValue("avatar", "", { shouldDirty: true }); }}>
                  Remove
                </Button>
              )}
            </div>
          </div>

          <section className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <FormInput name="fullName" label="Full Name" placeholder="Enter Full Name" required hint="Your first name is visible to the users" />
              <FormInput name="username" label="Username" required disabled hint="You cannot update your username" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormInput name="phoneNumber" label="Phone Number" placeholder="Enter Phone Number" />
              <FormInput name="country" label="Country" placeholder="Select Country" />
            </div>
            <FormInput leftIcon="email" name="email" label="Email" required disabled hint="Your email id is used to send notifications when offline" />
          </section>
        </section>
      </section>

      <section className="h-20 px-11 border-t flex items-center justify-end gap-3 shadow-[0_-1px_8px_3px_rgba(0,0,0,0.03)] shrink-0 bg-white">
        <Button variant="secondary" className="w-fit" type="button" onClick={() => form.reset()} disabled={!isDirty}>
          Cancel
        </Button>
        <Button className="w-fit" onClick={handleSubmit} disabled={!isDirty}>
          Update
        </Button>
      </section>
      </div>
    </FormWrapper>
  );
}
