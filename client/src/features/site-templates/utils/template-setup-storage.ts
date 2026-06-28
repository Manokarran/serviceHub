const STORAGE_PREFIX = 'servicehub:template-setup-seen:'

export function getTemplateSetupSeenKey(tenantSlug: string) {
  return `${STORAGE_PREFIX}${tenantSlug}`
}

export function hasSeenTemplateSetup(tenantSlug: string) {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(getTemplateSetupSeenKey(tenantSlug)) === '1'
}

export function markTemplateSetupSeen(tenantSlug: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getTemplateSetupSeenKey(tenantSlug), '1')
}
