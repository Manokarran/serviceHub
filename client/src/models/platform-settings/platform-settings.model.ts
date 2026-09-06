import mongoose, { Schema, type Model } from 'mongoose'

import { CREDIT_FEATURES, DEFAULT_CREDIT_COSTS, DEFAULT_SIGNUP_CREDITS } from '@/lib/constants/credits'

import type { IPlatformSettingsDocument } from './platform-settings.types'

const creditCostsSchema = new Schema(
  Object.fromEntries(CREDIT_FEATURES.map(feature => [feature, { type: Number, min: 0, max: 1000, required: true }])),
  { _id: false }
)

const platformSettingsSchema = new Schema<IPlatformSettingsDocument>(
  {
    key: { type: String, enum: ['default'], required: true, unique: true, default: 'default' },
    credits: {
      defaultSignupCredits: {
        type: Number,
        min: 0,
        max: 100_000,
        required: true,
        default: DEFAULT_SIGNUP_CREDITS
      },
      costs: {
        type: creditCostsSchema,
        required: true,
        default: () => ({ ...DEFAULT_CREDIT_COSTS })
      }
    }
  },
  {
    timestamps: true,
    collection: 'platform_settings'
  }
)

export const PlatformSettingsModel: Model<IPlatformSettingsDocument> =
  mongoose.models.PlatformSettings ??
  mongoose.model<IPlatformSettingsDocument>('PlatformSettings', platformSettingsSchema)
