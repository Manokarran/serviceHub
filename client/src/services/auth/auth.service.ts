import { Types } from 'mongoose'

import { AppError } from '@/lib/errors'
import {
  isTenantApproved,
  isTenantWorkspaceOpen,
  resolveTenantApprovalStatus,
  type TenantApprovalStatus,
  type TenantPlan
} from '@/lib/constants/tenant'
import type { UserRole } from '@/lib/constants/roles'
import { siteCustomerRepository, tenantRepository, userRepository } from '@/repositories'

type SyncGoogleUserInput = {
  googleId: string
  email: string
  name: string
  image?: string | null
}

export type AuthUserProfile = {
  id: string
  email: string
  name: string
  image?: string
  role?: UserRole
  tenantId?: string
  tenantName?: string
  tenantSlug?: string
  tenantPlan?: TenantPlan
  tenantApproved: boolean
  tenantApprovalStatus?: TenantApprovalStatus
  tenantWorkspaceOpen: boolean
  registrationComplete: boolean
}

export type AuthCustomerProfile = {
  id: string
  customerId: string
  email: string
  name: string
  image?: string
  tenantId: string
  tenantName: string
  tenantSlug: string
  context: 'customer'
}

/** Resolve a Mongo ObjectId string from a raw or populated tenantId ref. */
function resolveTenantObjectId(tenantId: unknown): string | null {
  if (!tenantId) {
    return null
  }

  if (typeof tenantId === 'string') {
    return Types.ObjectId.isValid(tenantId) ? tenantId : null
  }

  if (typeof tenantId === 'object') {
    const asRecord = tenantId as { _id?: unknown; toHexString?: () => string }

    // Populated tenant document
    if (asRecord._id != null) {
      const nested = asRecord._id

      if (typeof nested === 'string' && Types.ObjectId.isValid(nested)) {
        return nested
      }

      if (nested && typeof nested === 'object' && 'toHexString' in nested) {
        return (nested as { toHexString: () => string }).toHexString()
      }

      if (nested && typeof (nested as { toString?: () => string }).toString === 'function') {
        const value = (nested as { toString: () => string }).toString()

        return Types.ObjectId.isValid(value) ? value : null
      }
    }

    // Unpopulated ObjectId
    if (typeof asRecord.toHexString === 'function') {
      return asRecord.toHexString()
    }
  }

  return null
}

async function mapUserProfile(
  user: NonNullable<Awaited<ReturnType<typeof userRepository.findById>>>
): Promise<AuthUserProfile> {
  const base = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image
  }

  if (!user.tenantId) {
    return {
      ...base,
      tenantApproved: false,
      tenantWorkspaceOpen: false,
      registrationComplete: false
    }
  }

  const tenantId = resolveTenantObjectId(user.tenantId)

  if (!tenantId) {
    await userRepository.clearTenant(user._id.toString())

    return {
      ...base,
      tenantApproved: false,
      tenantWorkspaceOpen: false,
      registrationComplete: false
    }
  }

  // Always read approval from the tenant document (populate can be stale / incomplete)
  const loaded = await tenantRepository.findById(tenantId)

  if (!loaded) {
    await userRepository.clearTenant(user._id.toString())

    return {
      ...base,
      tenantApproved: false,
      tenantWorkspaceOpen: false,
      registrationComplete: false
    }
  }

  return {
    ...base,
    role: user.role,
    tenantId: loaded._id.toString(),
    tenantName: loaded.name,
    tenantSlug: loaded.slug,
    tenantPlan: loaded.plan,
    tenantApproved: isTenantApproved(loaded.approvalStatus, loaded.createdAt),
    tenantApprovalStatus: resolveTenantApprovalStatus(loaded.approvalStatus, loaded.createdAt),
    tenantWorkspaceOpen: isTenantWorkspaceOpen(loaded.approvalStatus, loaded.createdAt),
    registrationComplete: true
  }
}

export class AuthService {
  async syncGoogleCustomer(input: {
    tenantSlug: string
    googleId: string
    email: string
    name: string
    image?: string | null
  }): Promise<AuthCustomerProfile> {
    const tenant = await tenantRepository.findBySlug(input.tenantSlug)

    if (!tenant || tenant.status === 'suspended') {
      throw new AppError('This website is not available', 404, 'TENANT_INACTIVE')
    }

    let customer = await siteCustomerRepository.findByTenantAndGoogleId(tenant._id.toString(), input.googleId)

    const customerData = {
      name: input.name || 'Customer',
      email: input.email.toLowerCase(),
      image: input.image ?? undefined
    }

    if (!customer) {
      customer = await siteCustomerRepository.create({
        tenantId: tenant._id,
        googleId: input.googleId,
        ...customerData,
        isActive: true,
        lastLoginAt: new Date()
      })
    } else {
      customer = await siteCustomerRepository.updateProfile(tenant._id.toString(), customer._id.toString(), customerData)
    }

    if (!customer || !customer.isActive) {
      throw new AppError('Your customer account is inactive', 403, 'CUSTOMER_INACTIVE')
    }

    return {
      id: customer._id.toString(),
      customerId: customer._id.toString(),
      email: customer.email,
      name: customer.name,
      image: customer.image,
      tenantId: tenant._id.toString(),
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      context: 'customer'
    }
  }

  async getCustomerProfileByGoogleId(tenantSlug: string, googleId: string): Promise<AuthCustomerProfile | null> {
    const tenant = await tenantRepository.findBySlug(tenantSlug)

    if (!tenant || tenant.status === 'suspended') {
      return null
    }

    const customer = await siteCustomerRepository.findByTenantAndGoogleId(tenant._id.toString(), googleId)

    if (!customer || !customer.isActive) {
      return null
    }

    return {
      id: customer._id.toString(),
      customerId: customer._id.toString(),
      email: customer.email,
      name: customer.name,
      image: customer.image,
      tenantId: tenant._id.toString(),
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      context: 'customer'
    }
  }

  async syncGoogleUser(input: SyncGoogleUserInput): Promise<AuthUserProfile> {
    const email = input.email.toLowerCase()

    let user = await userRepository.findByGoogleId(input.googleId)

    if (!user) {
      user = await userRepository.findByEmail(email)

      if (user) {
        user = await userRepository.linkGoogleAccount(user._id.toString(), {
          googleId: input.googleId,
          name: input.name,
          image: input.image ?? undefined
        })
      } else {
        user = await userRepository.createFromGoogle({
          googleId: input.googleId,
          email,
          name: input.name,
          image: input.image ?? undefined
        })
      }
    } else {
      await userRepository.updateLastLogin(user._id.toString())
    }

    if (!user) {
      throw new AppError('Unable to sync Google account', 500, 'GOOGLE_SYNC_FAILED')
    }

    if (!user.isActive) {
      throw new AppError('Your account is inactive', 403, 'USER_INACTIVE')
    }

    const profile = await mapUserProfile(user)

    if (profile.registrationComplete && profile.tenantId) {
      const tenant = await tenantRepository.findById(profile.tenantId)

      if (tenant?.status === 'suspended') {
        throw new AppError('Your organization account is not active', 403, 'TENANT_INACTIVE')
      }
    }

    return profile
  }

  async getUserProfile(userId: string): Promise<AuthUserProfile | null> {
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      return null
    }

    try {
      const user = await userRepository.findById(userId)

      if (!user || !user.isActive) {
        return null
      }

      return await mapUserProfile(user)
    } catch (error) {
      console.error('[AuthService.getUserProfile]', error)

      return null
    }
  }

  async getUserProfileByEmail(email: string): Promise<AuthUserProfile | null> {
    try {
      const user = await userRepository.findByEmail(email)

      if (!user || !user.isActive) {
        return null
      }

      return await mapUserProfile(user)
    } catch (error) {
      console.error('[AuthService.getUserProfileByEmail]', error)

      return null
    }
  }
}

export const authService = new AuthService()
