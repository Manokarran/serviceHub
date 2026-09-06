import type { Block, FooterBlockProps, HeaderBlockProps, SectionBlockProps } from '@/features/your-space/types'

export type SuggestedBasePage = {
  slug: string
  title: string
  description: string
  blockCount: number
  source: 'base_template' | 'starter'
}

export type NavLink = { label: string; href: string }

const CANONICAL_ORDER = ['about', 'contact', 'pricing'] as const

const PAGE_TITLE_BY_SLUG: Record<string, string> = {
  about: 'About',
  contact: 'Contact',
  pricing: 'Pricing'
}

const ADD_PAGE_INTENT =
  /\b(?:add|create|include|insert|make|need|want|missing)\b[\s\w,-]{0,40}\b(about|contact|pricing)\b(?:\s+pages?)?/gi

/**
 * Prefer the master-base page order users expect: About → Contact → Pricing, then extras.
 */
export function sortSuggestedBasePages<T extends { slug: string }>(pages: T[]): T[] {
  const rank = (slug: string) => {
    const index = CANONICAL_ORDER.indexOf(slug.toLowerCase() as (typeof CANONICAL_ORDER)[number])

    return index === -1 ? 100 + slug.charCodeAt(0) : index
  }

  return [...pages].sort((a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug))
}

export function titleForBasePageSlug(slug: string, fallback?: string): string {
  const key = slug.toLowerCase()

  return PAGE_TITLE_BY_SLUG[key] ?? fallback ?? slug.charAt(0).toUpperCase() + slug.slice(1)
}

export function descriptionForBasePageSlug(slug: string): string {
  switch (slug.toLowerCase()) {
    case 'about':
      return 'Tell your story and build trust with visitors.'
    case 'contact':
      return 'A contact form and details matched to your current look.'
    case 'pricing':
      return 'Plans and pricing laid out in your site’s theme.'
    default:
      return 'Cloned from the master base design and matched to your theme.'
  }
}

/** Detect “add contact page”, “create about and contact”, etc. */
export function parseAddBasePageIntent(prompt: string): string[] {
  const found = new Set<string>()
  const matches = prompt.matchAll(ADD_PAGE_INTENT)

  for (const match of matches) {
    const slug = match[1]?.toLowerCase()

    if (slug) {
      found.add(slug)
    }
  }

  if (found.size === 0 && /\b(missing|add)\b.+\bpages?\b/i.test(prompt)) {
    for (const slug of CANONICAL_ORDER) {
      if (new RegExp(`\\b${slug}\\b`, 'i').test(prompt)) {
        found.add(slug)
      }
    }
  }

  return sortSuggestedBasePages([...found].map(slug => ({ slug }))).map(page => page.slug)
}

/** Soft “open the create-page list” phrasing with no specific page named. */
export function isOpenCreatePageListIntent(prompt: string): boolean {
  if (parseAddBasePageIntent(prompt).length > 0) {
    return false
  }

  return /\b(create|add|new)\b[\s\w-]{0,24}\bpage\b/i.test(prompt)
}

export function buildNavLinksForPageSlugs(pageSlugs: string[]): NavLink[] {
  const normalized = new Set(pageSlugs.map(slug => slug.toLowerCase()))

  const links: NavLink[] = [{ label: 'Home', href: '/' }]

  for (const slug of CANONICAL_ORDER) {
    if (normalized.has(slug)) {
      links.push({ label: titleForBasePageSlug(slug), href: slug })
    }
  }

  for (const slug of [...normalized].sort()) {
    if (slug === 'home' || CANONICAL_ORDER.includes(slug as (typeof CANONICAL_ORDER)[number])) {
      continue
    }

    links.push({ label: titleForBasePageSlug(slug), href: slug })
  }

  return links
}

function linkKey(link: { label?: string; href?: string }): string {
  return `${(link.href ?? '').replace(/^\//, '').toLowerCase()}::${(link.label ?? '').toLowerCase()}`
}

function mergeNavLinks(existing: NavLink[] | undefined, nextLinks: NavLink[]): NavLink[] {
  const merged = [...(existing ?? [])]
  const seen = new Set(merged.map(linkKey))

  for (const link of nextLinks) {
    const key = linkKey(link)
    const hrefKey = (link.href ?? '').replace(/^\//, '').toLowerCase()
    const alreadyHasHref = merged.some(item => (item.href ?? '').replace(/^\//, '').toLowerCase() === hrefKey)

    if (seen.has(key) || alreadyHasHref) {
      continue
    }

    merged.push({ ...link })
    seen.add(key)
  }

  return merged
}

/** Ensure header/footer nav includes the given links (idempotent). */
export function ensureNavLinksOnBlocks(blocks: Block[], links: NavLink[]): Block[] {
  if (links.length === 0) {
    return blocks
  }

  const walk = (nodes: Block[]): Block[] =>
    nodes.map(block => {
      if (block.type === 'header' || block.type === 'footer') {
        const props = { ...(block.props as HeaderBlockProps | FooterBlockProps) }
        const current = Array.isArray(props.navLinks) ? (props.navLinks as NavLink[]) : []

        return {
          ...block,
          props: {
            ...props,
            navLinks: mergeNavLinks(current, links)
          }
        }
      }

      if (block.type === 'section') {
        const props = block.props as SectionBlockProps

        return {
          ...block,
          props: {
            ...props,
            children: walk(props.children ?? []),
            primaryChildren: walk(props.primaryChildren ?? []),
            secondaryChildren: walk(props.secondaryChildren ?? [])
          }
        }
      }

      return block
    })

  return walk(blocks)
}
