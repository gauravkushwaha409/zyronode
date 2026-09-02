import { FormInput, FormTextarea, FormWrapper } from '@package/form';
import { useForm } from '@package/form';
import { Badge, Button, DialogWrapper } from '@package/ui';
import React, { useState } from 'react';
import { z } from 'zod';

const resolveSchema = z.object({
  subject: z.string().min(1, 'Required'),
  remarks: z.string().min(1, 'Required').max(100, 'Max 100 characters'),
});

export function ResolveUnresolveDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="alert-shade" leftIcon="unresolved" size="xs" className="w-fit" onClick={() => setOpen(true)}>
        Unresolved
      </Button>
      <DialogWrapper open={open} onOpenChange={setOpen} title="Mark as resolved" description="Add context for future reference">
        <ResolveForm setOpen={setOpen} />
      </DialogWrapper>
    </>
  );
}

function ResolveForm({ setOpen }: { setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const form = useForm<z.infer<typeof resolveSchema>>({ schema: resolveSchema, defaultValues: { subject: '', remarks: '' } });
  const handleClose = () => { form.reset(); setOpen(false); };
  const handleSubmit = form.handleSubmit((values) => {
    console.log('resolve', values);
    handleClose();
  });
  return (
    <FormWrapper useFormMethods={form} formProps={{ onSubmit: handleSubmit }}>
      <div className="p-6 flex flex-col gap-5">
        <FormInput label="Subject" name="subject" placeholder="Enter subject" required />
        <FormTextarea label="Remarks" name="remarks" hint="Maximum number of characters is 100" placeholder="Add remarks (e.g. Customer requesting discount, escalation needed...)" required />
        <div className="flex flex-col gap-2">
          <span className="typo-t3 text-gray-600">Lead Type</span>
          <Badge variant="alert" className="w-fit">Non-potential</Badge>
        </div>
      </div>
      <div className="px-6 pb-6 w-full grid grid-cols-2 gap-x-4">
        <Button type="button" className="w-full" variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button type="submit" className="w-full" rightIcon="long-arrow-right" onClick={handleSubmit}>Resolve</Button>
      </div>
    </FormWrapper>
  );
}
