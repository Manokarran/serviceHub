import { z } from 'zod'

import { tenantSlugSchema } from './auth.validator'

export const checkTenantSlugSchema = z.object({
  slug: tenantSlugSchema
})

export const updateTenantProfileSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name is required').max(120),
  slug: tenantSlugSchema,
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine(value => !value || /^https?:\/\//i.test(value), 'Enter a valid logo URL')
})

export type CheckTenantSlugInput = z.infer<typeof checkTenantSlugSchema>
export type UpdateTenantProfileInput = z.infer<typeof updateTenantProfileSchema>
