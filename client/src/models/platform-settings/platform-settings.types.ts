import type { Document } from 'mongoose'

import type { CreditCostMap } from '@/lib/constants/credits'

export interface IPlatformCreditSettings {
  defaultSignupCredits: number
  costs: CreditCostMap
}

export interface IPlatformSettings {
  key: 'default'
  credits: IPlatformCreditSettings
  createdAt: Date
  updatedAt: Date
}

export interface IPlatformSettingsDocument extends IPlatformSettings, Document {}
