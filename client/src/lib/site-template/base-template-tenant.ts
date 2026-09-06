import { connectDB } from '@/lib/db'
import { tenantRepository } from '@/repositories/tenant.repository'

import {
  BASE_TEMPLATE_TENANT_NAME,
  BASE_TEMPLATE_TENANT_SLUG
} from '@/lib/site-template/base-template-constants'

export { BASE_TEMPLATE_TENANT_NAME, BASE_TEMPLATE_TENANT_SLUG }

export async function getOrCreateBaseTemplateTenantId(): Promise<string> {
  await connectDB()

  const existing = await tenantRepository.findBySlug(BASE_TEMPLATE_TENANT_SLUG)

  if (existing) {
    return existing._id.toString()
  }

  const tenant = await tenantRepository.create({
    name: BASE_TEMPLATE_TENANT_NAME,
    slug: BASE_TEMPLATE_TENANT_SLUG,
    approvalStatus: 'approved'
  })

  await tenantRepository.updateSettings(tenant._id.toString(), { kind: 'base_template' })

  return tenant._id.toString()
}

export async function getBaseTemplateTenantSlug(): Promise<string> {
  await getOrCreateBaseTemplateTenantId()

  return BASE_TEMPLATE_TENANT_SLUG
}
