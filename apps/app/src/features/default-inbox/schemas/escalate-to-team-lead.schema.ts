import { z } from 'zod';

export const escalateToTeamLeadSchema = z.object({
  escalate_to: z.string(),
  remarks: z.string().min(20, 'Remarks must be at least 20 characters').max(100, 'Remarks must be at most 100 characters'),
});

export type EscalateToTeamLeadForm = z.infer<typeof escalateToTeamLeadSchema>;
