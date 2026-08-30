import { AppError } from '@/lib/errors'
import type { TenantPlan } from '@/lib/constants/tenant'
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

function mapUserProfile(user: NonNullable<Awaited<ReturnType<typeof userRepository.findById>>>): AuthUserProfile {
  const tenant = user.tenantId as unknown as
    | {
        _id: { toString(): string }
        name: string
        slug: string
        status: string
        plan: TenantPlan
      }
    | undefined

  const registrationComplete = Boolean(user.tenantId)
  const populatedTenant = tenant && typeof tenant === 'object' && '_id' in tenant ? tenant : undefined

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image,
    role: registrationComplete ? user.role : undefined,
    tenantId: populatedTenant?._id.toString(),
    tenantName: populatedTenant?.name,
    tenantSlug: populatedTenant?.slug,
    tenantPlan: populatedTenant?.plan,
    registrationComplete
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

    const tenant = user.tenantId as unknown as { status?: string } | undefined

    if (tenant?.status === 'suspended') {
      throw new AppError('Your organization account is not active', 403, 'TENANT_INACTIVE')
    }

    return mapUserProfile(user)
  }

  async getUserProfile(userId: string): Promise<AuthUserProfile | null> {
    const user = await userRepository.findById(userId)

    if (!user || !user.isActive) {
      return null
    }

    return mapUserProfile(user)
  }

  async getUserProfileByEmail(email: string): Promise<AuthUserProfile | null> {
    const user = await userRepository.findByEmail(email)

    if (!user || !user.isActive) {
      return null
    }

    return mapUserProfile(user)
  }
}

export const authService = new AuthService()
