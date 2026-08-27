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
  if (isHomePageSlug(pageSlug)) {
    return `/site/${tenantSlug}`
  }

  return `/site/${tenantSlug}/${pageSlug}`
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

  if (isExternalHref(trimmed) || isAnchorHref(trimmed)) {
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

  if (pages.some(page => page.slug === trimmed.replace(/^\//, ''))) {
    return trimmed.replace(/^\//, '')
  }

  return null
}

/**
 * Normalize href for public site navigation.
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

  if (isExternalHref(trimmed) || isAnchorHref(trimmed)) {
    return trimmed
  }

  const pageSlug = resolveInternalPageSlug(trimmed, tenantSlug, pages)

  if (pageSlug) {
    return getPublicPagePath(tenantSlug, pageSlug)
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
