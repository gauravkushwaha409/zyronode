import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid URL').optional(),
  phone: z.string().optional(),
  industry: z.string().optional(),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;