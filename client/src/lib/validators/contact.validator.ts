import { z } from 'zod'

export const contactFormSubmitSchema = z.object({
  tenantSlug: z.string().min(1).max(63),
  blockId: z.string().max(128).optional(),
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().email('Enter a valid email').max(254),
  phone: z.string().trim().max(32).optional(),
  description: z.string().trim().min(1, 'Please add a short description').max(2000),
  wantsSignup: z.boolean().default(false),
  website: z.string().max(0).optional()
})

export type ContactFormSubmitInput = z.infer<typeof contactFormSubmitSchema>

export const tenantContactSettingsSchema = z.object({
  contactNotificationEmail: z
    .string()
    .trim()
    .max(254)
    .superRefine((value, ctx) => {
      if (value && !z.string().email().safeParse(value).success) {
        ctx.addIssue({ code: 'custom', message: 'Enter a valid email' })
      }
    }),
  contactAutoReplyEnabled: z.boolean().optional(),
  contactAutoReplySubject: z.string().trim().max(200).optional(),
  contactAutoReplyMessage: z.string().trim().max(2000).optional()
})

export type TenantContactSettingsInput = z.infer<typeof tenantContactSettingsSchema>

export const updateLeadStatusSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(['new', 'read', 'archived'])
})

export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>

export const contactLeadFilterSchema = z.enum(['all', 'new', 'read', 'archived'])

export type ContactLeadFilterInput = z.infer<typeof contactLeadFilterSchema>
