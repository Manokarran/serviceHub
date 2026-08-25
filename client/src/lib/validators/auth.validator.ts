import { z } from 'zod'

export const tenantSlugSchema = z
  .string()
  .min(3, 'Workspace slug must be at least 3 characters')
  .max(63, 'Workspace slug must be at most 63 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only')

export const completeRegistrationSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name is required').max(120),
  slug: tenantSlugSchema,
  templateId: z.string().trim().optional()
})

export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>
