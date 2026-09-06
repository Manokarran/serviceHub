import 'server-only'

import {
  CREDIT_FEATURE_LABELS,
  DEFAULT_CREDIT_COSTS,
  DEFAULT_SIGNUP_CREDITS,
  type CreditCostMap,
  type CreditFeature
} from '@/lib/constants/credits'
import { AppError } from '@/lib/errors'
import type { IPlatformCreditSettings } from '@/models/platform-settings'
import {
  creditLedgerRepository,
  platformSettingsRepository,
  tenantRepository
} from '@/repositories'

export type TenantCreditsSnapshot = {
  balance: number
  costs: CreditCostMap
  defaultSignupCredits: number
}

export type CreditSpendResult = {
  balance: number
  charged: number
  feature: CreditFeature
}

function insufficientCreditsMessage(feature: CreditFeature, cost: number, balance: number) {
  const label = CREDIT_FEATURE_LABELS[feature]?.title ?? 'This action'

  return `${label} needs ${cost} credit${cost === 1 ? '' : 's'}, but you have ${balance}. Ask a super admin to top up your credits.`
}

export class CreditsService {
  async getPlatformCreditSettings(): Promise<IPlatformCreditSettings> {
    return platformSettingsRepository.getCreditSettings()
  }

  async updatePlatformCreditSettings(input: {
    defaultSignupCredits: number
    costs: CreditCostMap
  }): Promise<IPlatformCreditSettings> {
    return platformSettingsRepository.updateCreditSettings(input)
  }

  async getTenantSnapshot(
    tenantId: string,
    options?: { unlimited?: boolean }
  ): Promise<TenantCreditsSnapshot & { unlimited: boolean }> {
    if (options?.unlimited) {
      const settings = await platformSettingsRepository.getCreditSettings()

      return {
        balance: 0,
        costs: settings.costs,
        defaultSignupCredits: settings.defaultSignupCredits,
        unlimited: true
      }
    }

    await this.ensureWelcomeCreditsIfNeeded(tenantId)

    const [balance, settings] = await Promise.all([
      tenantRepository.getCreditsBalance(tenantId),
      platformSettingsRepository.getCreditSettings()
    ])

    if (balance === null) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    return {
      balance,
      costs: settings.costs,
      defaultSignupCredits: settings.defaultSignupCredits,
      unlimited: false
    }
  }

  /**
   * Existing orgs created before credits: grant the welcome pack once if they
   * still have a zero balance and no ledger history.
   * Also repairs accounts where the ledger recorded a grant but the balance field
   * never stuck (e.g. stale Mongoose schema during hot reload).
   */
  async ensureWelcomeCreditsIfNeeded(tenantId: string): Promise<void> {
    const balance = await tenantRepository.getCreditsBalance(tenantId)

    if (balance === null || balance > 0) {
      return
    }

    const history = await creditLedgerRepository.listForTenant(tenantId, 50)
    const hasUsage = history.some(entry => entry.reason === 'usage')
    const signupGrant = history.find(entry => entry.reason === 'signup_grant')

    if (!hasUsage && signupGrant && signupGrant.balanceAfter > 0) {
      await tenantRepository.setCreditsBalance(tenantId, signupGrant.balanceAfter)

      return
    }

    if (history.length === 0) {
      await this.grantSignupCredits(tenantId)
    }
  }

  async getFeatureCost(feature: CreditFeature): Promise<number> {
    return platformSettingsRepository.getFeatureCost(feature)
  }

  /** Grant default signup pack and record the ledger entry. */
  async grantSignupCredits(tenantId: string): Promise<number> {
    const settings = await platformSettingsRepository.getCreditSettings()
    const amount = settings.defaultSignupCredits ?? DEFAULT_SIGNUP_CREDITS

    if (amount <= 0) {
      return (await tenantRepository.getCreditsBalance(tenantId)) ?? 0
    }

    const updated = await tenantRepository.addCredits(tenantId, amount)

    if (!updated) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    await creditLedgerRepository.create({
      tenantId,
      delta: amount,
      balanceAfter: updated.creditsBalance,
      reason: 'signup_grant',
      description: `Welcome pack — ${amount} credits`
    })

    return updated.creditsBalance
  }

  async grantCredits(input: {
    tenantId: string
    amount: number
    actorEmail?: string
    actorUserId?: string
    description?: string
  }): Promise<number> {
    const amount = Math.floor(input.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError('Enter a positive credit amount', 400, 'INVALID_CREDIT_AMOUNT')
    }

    const updated = await tenantRepository.addCredits(input.tenantId, amount)

    if (!updated) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    await creditLedgerRepository.create({
      tenantId: input.tenantId,
      delta: amount,
      balanceAfter: updated.creditsBalance,
      reason: 'admin_grant',
      description: input.description ?? `Super admin added ${amount} credits`,
      actorEmail: input.actorEmail,
      actorUserId: input.actorUserId
    })

    return updated.creditsBalance
  }

  /**
   * Charge credits for a billable feature. Throws INSUFFICIENT_CREDITS when balance is too low.
   * Zero-cost features and unlimited (super admin) callers are no-ops.
   */
  async spend(input: {
    tenantId: string
    feature: CreditFeature
    actorUserId?: string
    description?: string
    metadata?: Record<string, unknown>
    unlimited?: boolean
  }): Promise<CreditSpendResult> {
    if (input.unlimited) {
      const balance = (await tenantRepository.getCreditsBalance(input.tenantId)) ?? 0

      return { balance, charged: 0, feature: input.feature }
    }

    const cost = await this.getFeatureCost(input.feature)

    if (cost <= 0) {
      const balance = (await tenantRepository.getCreditsBalance(input.tenantId)) ?? 0

      return { balance, charged: 0, feature: input.feature }
    }

    const updated = await tenantRepository.tryDeductCredits(input.tenantId, cost)

    if (!updated) {
      const balance = (await tenantRepository.getCreditsBalance(input.tenantId)) ?? 0

      throw new AppError(insufficientCreditsMessage(input.feature, cost, balance), 402, 'INSUFFICIENT_CREDITS')
    }

    const label = CREDIT_FEATURE_LABELS[input.feature]?.title ?? input.feature

    await creditLedgerRepository.create({
      tenantId: input.tenantId,
      delta: -cost,
      balanceAfter: updated.creditsBalance,
      reason: 'usage',
      feature: input.feature,
      description: input.description ?? `${label} (−${cost})`,
      actorUserId: input.actorUserId,
      metadata: input.metadata
    })

    return {
      balance: updated.creditsBalance,
      charged: cost,
      feature: input.feature
    }
  }

  /** Ensure balance covers a feature without charging yet (for UI pre-checks). */
  async assertCanAfford(
    tenantId: string,
    feature: CreditFeature,
    options?: { unlimited?: boolean }
  ): Promise<{ cost: number; balance: number }> {
    if (options?.unlimited) {
      return { cost: 0, balance: 0 }
    }

    const [cost, balance] = await Promise.all([
      this.getFeatureCost(feature),
      tenantRepository.getCreditsBalance(tenantId)
    ])

    if (balance === null) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    if (cost > 0 && balance < cost) {
      throw new AppError(insufficientCreditsMessage(feature, cost, balance), 402, 'INSUFFICIENT_CREDITS')
    }

    return { cost, balance }
  }

  resolveChatFeature(prompt: string, isMajorRedesign: boolean): CreditFeature {
    if (isMajorRedesign) {
      return 'ai_chat_major'
    }

    // Text / rewrite cues in chat map to generate/change pricing (same 1 credit default).
    if (/\b(rewrite|reword|rephrase|generate|write|change (the )?text|copy)\b/i.test(prompt)) {
      return 'generate_change_text'
    }

    if (/\b(background|unsplash|photo|image)\b/i.test(prompt)) {
      return 'change_image_background'
    }

    if (/\b(seo|meta description|page description|search engine)\b/i.test(prompt)) {
      return 'generate_seo'
    }

    return 'ai_chat_minor'
  }

  /** Fallback costs when settings cannot be loaded (client display). */
  getDefaultCosts(): CreditCostMap {
    return { ...DEFAULT_CREDIT_COSTS }
  }
}

export const creditsService = new CreditsService()
