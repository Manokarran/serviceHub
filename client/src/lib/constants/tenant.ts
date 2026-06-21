export const TENANT_STATUSES = ['trial', 'active', 'suspended'] as const

export type TenantStatus = (typeof TENANT_STATUSES)[number]

export const TENANT_PLANS = ['free', 'pro', 'enterprise'] as const

export type TenantPlan = (typeof TENANT_PLANS)[number]
