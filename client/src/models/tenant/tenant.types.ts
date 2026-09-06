import type { Document } from 'mongoose'

import type { TenantApprovalStatus, TenantPlan, TenantStatus } from '@/models/shared/enums'
import type { TenantLocation } from '@/lib/location/types'

export type TenantKind = 'base_template'

export interface ITenantSettings {
  /** System tenant used as the master website design for AI generation. */
  kind?: TenantKind
  primaryColor?: string
  logoUrl?: string
  customDomain?: string
  defaultTimezone?: string
  defaultCurrency?: string
  location?: TenantLocation
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
  /** Missing on legacy tenants — treat as approved at read time. */
  approvalStatus?: TenantApprovalStatus
  approvedAt?: Date
  approvedByEmail?: string
  rejectedAt?: Date
  /** Remaining AI / setup credits for this organization. */
  creditsBalance: number
  settings: ITenantSettings
  createdAt: Date
  updatedAt: Date
}

export interface ITenantDocument extends ITenant, Document {}
