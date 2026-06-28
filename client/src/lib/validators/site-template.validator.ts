import { z } from 'zod'

import { SITE_TEMPLATE_CATEGORIES } from '@/lib/constants/site-template'

const templateSlugSchema = z
  .string()
  .min(3, 'Template slug must be at least 3 characters')
  .max(63, 'Template slug must be at most 63 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only')

export const createSiteTemplateSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  slug: templateSlugSchema.optional(),
  description: z.string().trim().max(500).optional(),
  thumbnailUrl: z.union([z.string().trim().url(), z.literal('')]).optional(),
  category: z.enum(SITE_TEMPLATE_CATEGORIES).optional(),
  tags: z.array(z.string().trim().min(1).max(32)).max(10).optional()
})

export const updateSiteTemplateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  thumbnailUrl: z.union([z.string().trim().url(), z.literal('')]).optional(),
  category: z.enum(SITE_TEMPLATE_CATEGORIES).optional(),
  tags: z.array(z.string().trim().min(1).max(32)).max(10).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional()
})

export type CreateSiteTemplateInput = z.infer<typeof createSiteTemplateSchema>
export type UpdateSiteTemplateInput = z.infer<typeof updateSiteTemplateSchema>
