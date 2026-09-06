import { connectDB } from '@/lib/db'
import {
  CREDIT_FEATURES,
  DEFAULT_CREDIT_COSTS,
  DEFAULT_SIGNUP_CREDITS,
  type CreditCostMap,
  type CreditFeature
} from '@/lib/constants/credits'
import { PlatformSettingsModel, type IPlatformCreditSettings } from '@/models/platform-settings'

function normalizeCosts(raw?: Partial<CreditCostMap> | null): CreditCostMap {
  const costs = { ...DEFAULT_CREDIT_COSTS }

  for (const feature of CREDIT_FEATURES) {
    const value = raw?.[feature]

    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      costs[feature] = Math.min(1000, Math.floor(value))
    }
  }

  return costs
}

export class PlatformSettingsRepository {
  async getCreditSettings(): Promise<IPlatformCreditSettings> {
    await connectDB()

    const doc = await PlatformSettingsModel.findOneAndUpdate(
      { key: 'default' },
      {
        $setOnInsert: {
          key: 'default',
          credits: {
            defaultSignupCredits: DEFAULT_SIGNUP_CREDITS,
            costs: { ...DEFAULT_CREDIT_COSTS }
          }
        }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).exec()

    return {
      defaultSignupCredits:
        typeof doc?.credits?.defaultSignupCredits === 'number'
          ? doc.credits.defaultSignupCredits
          : DEFAULT_SIGNUP_CREDITS,
      costs: normalizeCosts(doc?.credits?.costs)
    }
  }

  async updateCreditSettings(input: {
    defaultSignupCredits: number
    costs: CreditCostMap
  }): Promise<IPlatformCreditSettings> {
    await connectDB()

    const credits: IPlatformCreditSettings = {
      defaultSignupCredits: Math.max(0, Math.min(100_000, Math.floor(input.defaultSignupCredits))),
      costs: normalizeCosts(input.costs)
    }

    const doc = await PlatformSettingsModel.findOneAndUpdate(
      { key: 'default' },
      { $set: { credits } },
      { upsert: true, returnDocument: 'after', runValidators: true }
    ).exec()

    return {
      defaultSignupCredits: doc?.credits?.defaultSignupCredits ?? credits.defaultSignupCredits,
      costs: normalizeCosts(doc?.credits?.costs ?? credits.costs)
    }
  }

  async getFeatureCost(feature: CreditFeature): Promise<number> {
    const settings = await this.getCreditSettings()

    return settings.costs[feature] ?? DEFAULT_CREDIT_COSTS[feature]
  }
}

export const platformSettingsRepository = new PlatformSettingsRepository()
