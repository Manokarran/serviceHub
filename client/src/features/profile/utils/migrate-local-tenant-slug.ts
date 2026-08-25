import { STORAGE_KEY_PREFIX } from '@/features/your-space/constants'
import { getTemplateSetupSeenKey } from '@/features/site-templates/utils/template-setup-storage'

export function migrateLocalTenantSlug(previousSlug: string, nextSlug: string) {
  if (typeof window === 'undefined' || !previousSlug || previousSlug === nextSlug) {
    return
  }

  const keys: string[] = []

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)

    if (key) {
      keys.push(key)
    }
  }

  const previousPagePrefix = `${STORAGE_KEY_PREFIX}:${previousSlug}:`
  const nextPagePrefix = `${STORAGE_KEY_PREFIX}:${nextSlug}:`

  for (const key of keys) {
    if (!key.startsWith(previousPagePrefix)) {
      continue
    }

    const value = window.localStorage.getItem(key)

    if (value !== null) {
      window.localStorage.setItem(`${nextPagePrefix}${key.slice(previousPagePrefix.length)}`, value)
    }

    window.localStorage.removeItem(key)
  }

  const previousSetupKey = getTemplateSetupSeenKey(previousSlug)
  const setupValue = window.localStorage.getItem(previousSetupKey)

  if (setupValue !== null) {
    window.localStorage.setItem(getTemplateSetupSeenKey(nextSlug), setupValue)
    window.localStorage.removeItem(previousSetupKey)
  }
}
