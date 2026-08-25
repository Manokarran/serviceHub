import type { Document } from 'mongoose'

import type { TenantPlan, TenantStatus } from '@/models/shared/enums'

export type TenantKind = 'base_template'

export interface ITenantSettings {
  /** System tenant used as the master website design for AI generation. */
  kind?: TenantKind
  primaryColor?: string
  logoUrl?: string
  customDomain?: string
  /** When the organization moved past template onboarding. */
  siteStartedAt?: Date
  /** Last applied website template (bootstrap or replace). */
  appliedTemplateId?: string
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
