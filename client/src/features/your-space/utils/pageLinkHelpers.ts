import { getPublicPagePath } from '@/lib/utils/public-site-url'
import { isHomePageSlug } from '@/lib/utils/page-slug'
import type { SitePageSummary } from '@/models/site-page'

export type LinkTargetType = 'page' | 'url' | 'anchor'

export type ParsedLinkTarget = {
  type: LinkTargetType
  pageSlug?: string
  href: string
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
