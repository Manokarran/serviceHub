import { z } from 'zod'

import { SERVICE_CURRENCY_OPTIONS } from '@/lib/constants/service'
import { isValidTimeZone } from '@/lib/utils/timezone'

import { tenantSlugSchema } from './auth.validator'

export const checkTenantSlugSchema = z.object({
  slug: tenantSlugSchema
})

const locationContextSchema = z
  .object({
    countryCode: z.string().trim().length(2).optional(),
    country: z.string().trim().max(100).optional(),
    region: z.string().trim().max(100).optional(),
    place: z.string().trim().max(100).optional()
  })
  .optional()

export const updateTenantProfileSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name is required').max(120),
  slug: tenantSlugSchema,
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine(value => !value || /^https?:\/\//i.test(value), 'Enter a valid logo URL'),
  defaultTimezone: z
    .string()
    .trim()
    .max(64)
    .refine(value => !value || isValidTimeZone(value), 'Choose a valid site timezone'),
  defaultCurrency: z
    .enum(SERVICE_CURRENCY_OPTIONS.map(option => option.code) as [string, ...string[]])
    .or(z.literal('')),
  location: z
    .object({
      address: z.string().trim().min(1, 'Enter an address').max(500),
      latitude: z.number().finite().min(-90).max(90),
      longitude: z.number().finite().min(-180).max(180),
      context: locationContextSchema
    })
    .optional()
})

export type CheckTenantSlugInput = z.infer<typeof checkTenantSlugSchema>
export type UpdateTenantProfileInput = z.infer<typeof updateTenantProfileSchema>
