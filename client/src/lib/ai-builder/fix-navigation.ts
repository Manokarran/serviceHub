import type {
  Block,
  ButtonBlockProps,
  FooterBlockProps,
  HeaderBlockProps,
  HeroBlockProps,
  NavLinkItem,
  PricingBlockProps,
  ShowcaseBlockProps,
  ShowcaseItem
} from '@/features/your-space/types'
import { buildPageLink } from '@/features/your-space/utils/pageLinkHelpers'
import { mapBlocks } from '@/lib/ai-site-wizard/block-media'
import { isHomePageSlug } from '@/lib/utils/page-slug'
import type { SitePageSummary } from '@/models/site-page/site-page.types'

export type NavigationFixChange = {
  control: string
  label: string
  pageTitle: string
  from: string
  to: string
}

export type FixNavigationResult = {
  blocks: Block[]
  changes: NavigationFixChange[]
}

type PageTarget = {
  slug: string
  title: string
  href: string
  keys: string[]
}

const PAGE_ALIASES: Record<string, string[]> = {
  home: ['home', 'homepage', 'home page', 'main', 'main page', 'start'],
  about: ['about', 'about us', 'our story', 'who we are', 'our company', 'our team'],
  contact: ['contact', 'contact us', 'get in touch', 'reach us', 'reach out', 'enquire', 'inquire', 'enquiry'],
  pricing: ['pricing', 'prices', 'plans', 'our plans', 'packages', 'rates', 'our pricing']
}

const FIX_NAV_INTENT =
  /\b(fix|repair|correct|update|wire|sync)\b[\s\w-]{0,24}\b(nav|navigation|menu|menus|links?|buttons?)\b/i

function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function uniqueKeys(values: string[]): string[] {
  const seen = new Set<string>()
  const keys: string[] = []

  for (const value of values) {
    const key = normalizeLabel(value)

    if (!key || seen.has(key)) {
      continue
    }

    seen.add(key)
    keys.push(key)
  }

  return keys
}

function buildPageTargets(pages: SitePageSummary[], tenantSlug: string): PageTarget[] {
  return pages.map(page => {
    const slugKey = page.slug.replace(/-/g, ' ')
    const aliases = PAGE_ALIASES[page.slug.toLowerCase()] ?? []

    return {
      slug: page.slug,
      title: page.title,
      href: buildPageLink(tenantSlug, page.slug),
      keys: uniqueKeys([page.title, page.slug, slugKey, ...aliases, ...(isHomePageSlug(page.slug) ? ['home'] : [])])
    }
  })
}

/**
 * Prefer the strongest label→page match: exact key, then whole-word containment,
 * then a short label fully contained in a page title (e.g. "Contact" in "Contact Us").
 */
function matchPageForLabel(label: string, targets: PageTarget[]): PageTarget | null {
  const normalized = normalizeLabel(label)

  if (!normalized || normalized.length < 2) {
    return null
  }

  const exact = targets.find(target => target.keys.includes(normalized))

  if (exact) {
    return exact
  }

  const wordBoundaryMatches = targets
    .map(target => {
      const hit = target.keys.find(key => {
        if (key.length < 3) {
          return false
        }

        const pattern = new RegExp(`(?:^|\\s)${key.replace(/\s+/g, '\\s+')}(?:\\s|$)`)

        return pattern.test(normalized)
      })

      return hit ? { target, score: hit.length } : null
    })
    .filter((entry): entry is { target: PageTarget; score: number } => Boolean(entry))
    .sort((a, b) => b.score - a.score)

  if (wordBoundaryMatches[0]) {
    return wordBoundaryMatches[0].target
  }

  const contained = targets
    .map(target => {
      const hit = target.keys.find(key => key.length >= 4 && (normalized.includes(key) || key.includes(normalized)))

      return hit ? { target, score: Math.min(normalized.length, hit.length) } : null
    })
    .filter((entry): entry is { target: PageTarget; score: number } => Boolean(entry))
    .sort((a, b) => b.score - a.score)

  return contained[0]?.target ?? null
}

function hrefAlreadyPointsToPage(href: string, target: PageTarget, tenantSlug: string, pages: SitePageSummary[]): boolean {
  const trimmed = href.trim()

  if (!trimmed) {
    return false
  }

  if (trimmed === target.href || trimmed === target.slug || trimmed === `/${target.slug}`) {
    return true
  }

  const homePath = buildPageLink(tenantSlug, 'home')

  if (isHomePageSlug(target.slug) && (trimmed === '/' || trimmed === homePath || trimmed === '/home')) {
    return true
  }

  for (const page of pages) {
    if (page.slug !== target.slug) {
      continue
    }

    const path = buildPageLink(tenantSlug, page.slug)

    if (trimmed === path) {
      return true
    }
  }

  return false
}

function shouldSkipExistingHref(href: string): boolean {
  const trimmed = href.trim()

  if (!trimmed) {
    return false
  }

  // Keep intentional off-site actions (email / phone / absolute URLs).
  return (
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  )
}

function recordChange(
  changes: NavigationFixChange[],
  control: string,
  label: string,
  target: PageTarget,
  from: string,
  to: string
) {
  changes.push({
    control,
    label,
    pageTitle: target.title,
    from: from.trim() || '(empty)',
    to
  })
}

function fixNavLinks(
  links: NavLinkItem[] | undefined,
  targets: PageTarget[],
  tenantSlug: string,
  pages: SitePageSummary[],
  changes: NavigationFixChange[],
  control: string
): NavLinkItem[] | undefined {
  if (!Array.isArray(links)) {
    return links
  }

  return links.map(link => {
    const label = typeof link.label === 'string' ? link.label : ''
    const href = typeof link.href === 'string' ? link.href : ''
    const target = matchPageForLabel(label, targets)
    let nextHref = href
    let children = link.children

    if (target && !shouldSkipExistingHref(href) && !hrefAlreadyPointsToPage(href, target, tenantSlug, pages)) {
      nextHref = target.href
      recordChange(changes, control, label || target.title, target, href, target.href)
    }

    if (Array.isArray(link.children) && link.children.length > 0) {
      children = fixNavLinks(link.children, targets, tenantSlug, pages, changes, `${control} submenu`)
    }

    return {
      ...link,
      href: nextHref,
      ...(children ? { children } : {})
    }
  })
}

function fixLabeledLink(
  label: unknown,
  href: unknown,
  targets: PageTarget[],
  tenantSlug: string,
  pages: SitePageSummary[],
  changes: NavigationFixChange[],
  control: string
): string | null {
  if (typeof label !== 'string' || !label.trim()) {
    return null
  }

  if (typeof href !== 'string' && href != null) {
    return null
  }

  const current = typeof href === 'string' ? href : ''
  const target = matchPageForLabel(label, targets)

  if (!target || shouldSkipExistingHref(current) || hrefAlreadyPointsToPage(current, target, tenantSlug, pages)) {
    return null
  }

  recordChange(changes, control, label, target, current, target.href)

  return target.href
}

/**
 * Walk the draft and point menu items / buttons at pages whose names match their labels.
 */
export function fixNavigationOnBlocks(
  blocks: Block[],
  pages: SitePageSummary[],
  tenantSlug: string,
  pageSlug = 'current'
): FixNavigationResult {
  const targets = buildPageTargets(pages, tenantSlug)
  const changes: NavigationFixChange[] = []

  if (targets.length === 0) {
    return { blocks, changes }
  }

  const nextBlocks = mapBlocks(blocks, pageSlug, '/blocks', (block, _path, props) => {
    const next = { ...props }

    if (block.type === 'header' || block.type === 'footer') {
      const chrome = next as unknown as HeaderBlockProps | FooterBlockProps

      next.navLinks = fixNavLinks(
        chrome.navLinks,
        targets,
        tenantSlug,
        pages,
        changes,
        block.type === 'header' ? 'Header menu' : 'Footer menu'
      )
    }

    if (block.type === 'hero') {
      const hero = next as unknown as HeroBlockProps
      const primary = fixLabeledLink(
        hero.buttonText,
        hero.buttonLink,
        targets,
        tenantSlug,
        pages,
        changes,
        'Hero button'
      )
      const secondary = fixLabeledLink(
        hero.secondaryButtonText,
        hero.secondaryButtonLink,
        targets,
        tenantSlug,
        pages,
        changes,
        'Hero secondary button'
      )

      if (primary) {
        next.buttonLink = primary
      }

      if (secondary) {
        next.secondaryButtonLink = secondary
      }
    }

    if (block.type === 'button') {
      const button = next as unknown as ButtonBlockProps
      const fixed = fixLabeledLink(button.text, button.link, targets, tenantSlug, pages, changes, 'Button')

      if (fixed) {
        next.link = fixed
      }
    }

    if (block.type === 'showcase') {
      const showcase = next as unknown as ShowcaseBlockProps

      next.items = (showcase.items ?? []).map((item, index) => {
        const fixed = fixLabeledLink(
          item.buttonText,
          item.buttonLink,
          targets,
          tenantSlug,
          pages,
          changes,
          `Showcase item ${index + 1}`
        )

        if (!fixed) {
          return item
        }

        return { ...item, buttonLink: fixed } satisfies ShowcaseItem
      })
    }

    if (block.type === 'pricing') {
      const pricing = next as unknown as PricingBlockProps

      next.plans = (pricing.plans ?? []).map((plan, index) => {
        const fixed = fixLabeledLink(
          plan.ctaText,
          plan.ctaLink,
          targets,
          tenantSlug,
          pages,
          changes,
          `Pricing plan ${index + 1}`
        )

        if (!fixed) {
          return plan
        }

        return { ...plan, ctaLink: fixed }
      })
    }

    return next
  })

  return { blocks: nextBlocks, changes }
}

export function isFixNavigationIntent(prompt: string): boolean {
  return FIX_NAV_INTENT.test(prompt)
}

export function summarizeNavigationFixes(changes: NavigationFixChange[]): string {
  if (changes.length === 0) {
    return 'I checked menus and buttons — everything that matched a page name was already linked correctly.'
  }

  if (changes.length === 1) {
    const change = changes[0]

    return `Linked “${change.label}” (${change.control}) to your ${change.pageTitle} page.`
  }

  return `Fixed ${changes.length} navigation links where labels matched your page names.`
}
