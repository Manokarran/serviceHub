import { z } from 'zod'

export const siteAnalyticsEventSchema = z.object({
  tenantSlug: z.string().trim().min(1).max(63),
  visitorId: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[a-zA-Z0-9-]+$/, 'Invalid visitor id'),
  type: z.enum(['view', 'click']),
  pageSlug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Invalid page')
    .optional()
    .default('home')
})

export type SiteAnalyticsEventInput = z.infer<typeof siteAnalyticsEventSchema>
