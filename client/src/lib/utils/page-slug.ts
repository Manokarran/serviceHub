const RESERVED_SLUGS = new Set(['home', 'api', 'admin', 'login', 'register', 'site'])

/**
 * Convert a human-readable page title into a URL-safe slug.
 */
export function slugifyPageTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)

  return slug || 'page'
}

export function isReservedPageSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase())
}

export function isHomePageSlug(slug: string): boolean {
  return slug.toLowerCase() === 'home'
}

/**
 * Ensure a slug is unique among existing slugs by appending -2, -3, etc.
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  const normalized = new Set(existingSlugs.map(s => s.toLowerCase()))
  let candidate = baseSlug
  let counter = 2

  while (normalized.has(candidate.toLowerCase()) || isReservedPageSlug(candidate)) {
    candidate = `${baseSlug}-${counter}`
    counter += 1
  }

  return candidate
}
