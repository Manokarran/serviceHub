'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { requireSuperAdminSession } from '@/lib/auth/require-super-admin'
import { hasUnlimitedCredits } from '@/lib/credits/has-unlimited-credits'
import {
  CREDIT_FEATURES,
  CREDIT_PRICING_DISPLAY,
  type CreditCostMap,
  type CreditFeature
} from '@/lib/constants/credits'
import { AppError } from '@/lib/errors'
import { creditsService } from '@/services/credits'
import { tenantAdminService } from '@/services/tenant/tenant-admin.service'
import { tenantRepository } from '@/repositories'

type SnapshotResult =
  | {
      success: true
      balance: number
      costs: CreditCostMap
      defaultSignupCredits: number
      pricing: typeof CREDIT_PRICING_DISPLAY
      tenantApproved: boolean
      unlimited: boolean
    }
  | { success: false; error: string }

type SettingsResult =
  | {
      success: true
      defaultSignupCredits: number
      costs: CreditCostMap
      pricing: typeof CREDIT_PRICING_DISPLAY
    }
  | { success: false; error: string }

type SimpleResult = { success: true; balance?: number } | { success: false; error: string }

const costsSchema = z.object(
  Object.fromEntries(
    CREDIT_FEATURES.map(feature => [feature, z.number().int().min(0).max(1000)])
  ) as Record<CreditFeature, z.ZodNumber>
)

const updateSettingsSchema = z.object({
  defaultSignupCredits: z.number().int().min(0).max(100_000),
  costs: costsSchema
})

const grantSchema = z.object({
  tenantId: z.string().min(1),
  amount: z.number().int().min(1).max(100_000),
  description: z.string().trim().max(200).optional()
})

export async function getMyCreditsSnapshotAction(): Promise<SnapshotResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'No organization on this account.' }
    }

    const unlimited = hasUnlimitedCredits(session.user)
    const snapshot = await creditsService.getTenantSnapshot(session.user.tenantId, { unlimited })

    return {
      success: true,
      balance: unlimited ? 0 : snapshot.balance,
      costs: snapshot.costs,
      defaultSignupCredits: snapshot.defaultSignupCredits,
      pricing: CREDIT_PRICING_DISPLAY,
      tenantApproved: session.user.tenantApproved === true,
      unlimited
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Could not load credits.' }
  }
}

export async function getPlatformCreditSettingsAction(): Promise<SettingsResult> {
  try {
    await requireSuperAdminSession()
    const settings = await creditsService.getPlatformCreditSettings()

    return {
      success: true,
      defaultSignupCredits: settings.defaultSignupCredits,
      costs: settings.costs,
      pricing: CREDIT_PRICING_DISPLAY
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Could not load credit settings.' }
  }
}

export async function updatePlatformCreditSettingsAction(input: unknown): Promise<SettingsResult> {
  try {
    await requireSuperAdminSession()
    const parsed = updateSettingsSchema.safeParse(input)

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid credit settings' }
    }

    const settings = await creditsService.updatePlatformCreditSettings(parsed.data)
    revalidatePath('/super-admin')
    revalidatePath('/super-admin/credits')

    return {
      success: true,
      defaultSignupCredits: settings.defaultSignupCredits,
      costs: settings.costs,
      pricing: CREDIT_PRICING_DISPLAY
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Could not save credit settings.' }
  }
}

export async function grantTenantCreditsAction(input: unknown): Promise<SimpleResult> {
  try {
    const session = await requireSuperAdminSession()
    const parsed = grantSchema.safeParse(input)

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid grant' }
    }

    const balance = await creditsService.grantCredits({
      tenantId: parsed.data.tenantId,
      amount: parsed.data.amount,
      actorEmail: session.user.email ?? undefined,
      actorUserId: session.user.id,
      description: parsed.data.description
    })

    revalidatePath('/super-admin/requests')

    return { success: true, balance }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Could not grant credits.' }
  }
}

export async function approveTenantRegistrationWithCreditsAction(
  tenantId: string,
  bonusCredits = 0
): Promise<SimpleResult> {
  try {
    const session = await requireSuperAdminSession()

    await tenantAdminService.approveTenant(tenantId, session.user.email ?? 'super-admin')

    if (bonusCredits > 0) {
      await creditsService.grantCredits({
        tenantId,
        amount: Math.floor(bonusCredits),
        actorEmail: session.user.email ?? undefined,
        actorUserId: session.user.id,
        description: 'Bonus credits on approval'
      })
    }

    revalidatePath('/super-admin/requests')
    revalidatePath('/super-admin')

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to approve organization.' }
  }
}

export async function getTenantCreditsForAdminAction(
  tenantId: string
): Promise<{ success: true; balance: number } | { success: false; error: string }> {
  try {
    await requireSuperAdminSession()
    const balance = await tenantRepository.getCreditsBalance(tenantId)

    if (balance === null) {
      return { success: false, error: 'Organization not found' }
    }

    return { success: true, balance }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Could not load balance.' }
  }
}
