import type { Document } from 'mongoose'

import type { TenantPlan, TenantStatus } from '@/models/shared/enums'

export interface ITenantSettings {
  primaryColor?: string
  logoUrl?: string
  customDomain?: string
  /** Overrides owner email for contact form notifications. */
  contactNotificationEmail?: string
  contactAutoReplyEnabled?: boolean
  contactAutoReplySubject?: string
  contactAutoReplyMessage?: string
}

export interface ITenant {
  name: string
  slug: string
  status: TenantStatus
  plan: TenantPlan
  settings: ITenantSettings
  createdAt: Date
  updatedAt: Date
}

export interface ITenantDocument extends ITenant, Document {}
