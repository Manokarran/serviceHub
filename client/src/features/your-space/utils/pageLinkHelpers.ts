import { getPublicPagePath } from '@/lib/utils/public-site-url'
import { isHomePageSlug } from '@/lib/utils/page-slug'
import type { SitePageSummary } from '@/models/site-page/site-page.types'

export type LinkTargetType = 'page' | 'url' | 'anchor'

export type ParsedLinkTarget = {
  type: LinkTargetType
  pageSlug?: string
  href: string
}

export function isExternalHref(href: string): boolean {
  const trimmed = href.trim()

  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  )
}

export function isAnchorHref(href: string): boolean {
  const trimmed = href.trim()

  return trimmed.startsWith('#')
}

/**
 * Resolve a stored href to a link target type for the page picker UI.
 */
export function parseLinkTarget(href: string, pages: SitePageSummary[], tenantSlug: string): ParsedLinkTarget {
  const trimmed = href.trim()

  if (!trimmed || trimmed === '#') {
    return { type: 'anchor', href: '#' }
  }

  if (trimmed.startsWith('#')) {
    return { type: 'anchor', href: trimmed }
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return { type: 'url', href: trimmed }
  }

  for (const page of pages) {
    const pagePath = getPublicPagePath(tenantSlug, page.slug)

    if (trimmed === pagePath || trimmed === page.slug || trimmed === `/${page.slug}`) {
      return { type: 'page', pageSlug: page.slug, href: pagePath }
    }
  }

  return { type: 'url', href: trimmed }
}

/**
 * Build the href stored on blocks from a page picker selection.
 */
export function buildPageLink(tenantSlug: string, pageSlug: string): string {
  return getPublicPagePath(tenantSlug, pageSlug)
}

/**
 * Display label for a page in the link picker.
 */
export function getPageLinkLabel(page: SitePageSummary): string {
  return page.isHome ? `${page.title} (Home)` : page.title
}

/**
 * Short path shown in the pages panel and link preview.
 */
export function getPagePathLabel(tenantSlug: string, pageSlug: string): string {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim()

  if (root) {
    if (isHomePageSlug(pageSlug)) {
      return `${tenantSlug}.${root}`
    }

    return `${tenantSlug}.${root}/${pageSlug}`
  }

  if (isHomePageSlug(pageSlug)) {
    return `/site/${tenantSlug}`
  }

  return `/site/${tenantSlug}/${pageSlug}`
}

function isSimplePageSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value)
}

/**
 * Resolve an internal site page slug from a stored or public href.
 */
export function resolveInternalPageSlug(
  href: string,
  tenantSlug: string,
  pages: SitePageSummary[] = []
): string | null {
  const trimmed = href.trim()

  if (!trimmed || trimmed === '#') {
    return null
  }

  if (isExternalHref(trimmed)) {
    return null
  }

  // Templates store Home as "/" — never send public-site visitors to the app dashboard.
  if (tenantSlug && (trimmed === '/' || trimmed === '/home')) {
    return 'home'
  }

  // Starter / hash nav: "#about" → about page when that page exists.
  // Builder-safe hrefs use "#page/{slug}" so middle-click doesn't leave the app.
  // On the live public site, pages[] is empty — still treat "#about" as the about page.
  if (isAnchorHref(trimmed)) {
    const raw = trimmed.slice(1).split('?')[0]?.trim() ?? ''
    const slug = raw.startsWith('page/') ? raw.slice('page/'.length).split('/')[0]?.trim() : raw.split('/')[0]?.trim()

    if (!slug || !isSimplePageSlug(slug)) {
      return null
    }

    if (pages.length === 0 || pages.some(page => page.slug === slug)) {
      return isHomePageSlug(slug) ? 'home' : slug
    }

    return null
  }

  const parsed = parseLinkTarget(trimmed, pages, tenantSlug)

  if (parsed.type === 'page' && parsed.pageSlug) {
    return parsed.pageSlug
  }

  const publicBase = `/site/${tenantSlug}`

  if (trimmed === publicBase || trimmed === `${publicBase}/`) {
    return 'home'
  }

  if (trimmed.startsWith(`${publicBase}/`)) {
    const slug = trimmed.slice(publicBase.length + 1).split('/')[0]?.split('?')[0]?.split('#')[0]

    return slug || null
  }

  // Templates often store "about" or "/about" without the /site/{tenant} prefix.
  const bare = trimmed.replace(/^\//, '').split(/[?#]/)[0]?.trim() ?? ''

  if (bare && !bare.includes('/') && isSimplePageSlug(bare)) {
    if (pages.length === 0 || pages.some(page => page.slug === bare)) {
      return isHomePageSlug(bare) ? 'home' : bare
    }
  }

  return null
}

/**
 * Normalize href for public site navigation.
 * Always returns /site/{tenant}/... on the app host so path-based URLs keep the tenant.
 */
export function resolvePublicNavigationHref(
  href: string,
  tenantSlug: string,
  pages: SitePageSummary[] = []
): string {
  const trimmed = href.trim()

  if (!trimmed || trimmed === '#') {
    return '#'
  }

  if (isExternalHref(trimmed)) {
    return trimmed
  }

  const pageSlug = resolveInternalPageSlug(trimmed, tenantSlug, pages)

  if (pageSlug) {
    return getPublicPagePath(tenantSlug, pageSlug)
  }

  // Real in-page anchors (e.g. #contact-form) that are not pages — keep as-is.
  if (isAnchorHref(trimmed)) {
    return trimmed
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export async function navigateWithTransition(navigate: () => void | Promise<void>) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    const transition = (
      document as Document & {
        startViewTransition: (callback: () => void | Promise<void>) => { finished: Promise<void> }
      }
    ).startViewTransition(() => Promise.resolve(navigate()))

    await transition.finished

    return
  }

  await Promise.resolve(navigate())
}
