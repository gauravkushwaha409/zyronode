import { z } from 'zod';

export const defaultInboxSearchSchema = z.object({
  conversation: z.string().nullish(),
  'inbox-user': z.string().nullish(),
  'active-status': z.string().nullish(),
  status: z.string().nullish(),
  channel: z.string().nullish(),
});

export type DefaultInboxSearch = z.infer<typeof defaultInboxSearchSchema>;
