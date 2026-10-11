import {
  clampPatternStrength,
  DEFAULT_PAGE_PATTERN_HOVER,
  DEFAULT_PAGE_PATTERN_LOAD,
  isPagePatternId,
  type PagePatternConfig,
  type PagePatternScope
} from '../constants/pagePatterns'
import type { SiteMisc, SiteStyles } from '../types/siteStyles'

export function readSitePattern(misc: SiteMisc): PagePatternConfig {
  return {
    pattern: isPagePatternId(misc.pagePattern) ? misc.pagePattern : 'none',
    loadStrength: clampPatternStrength(misc.pagePatternLoadStrength ?? DEFAULT_PAGE_PATTERN_LOAD),
    hoverStrength: clampPatternStrength(misc.pagePatternHoverStrength ?? DEFAULT_PAGE_PATTERN_HOVER)
  }
}

export function readPagePatternOverride(misc: SiteMisc, pageSlug: string): PagePatternConfig | null {
  const raw = misc.pagePatternOverrides?.[pageSlug]

  if (!raw || !isPagePatternId(raw.pattern)) {
    return null
  }

  return {
    pattern: raw.pattern,
    loadStrength: clampPatternStrength(raw.loadStrength),
    hoverStrength: clampPatternStrength(raw.hoverStrength)
  }
}

export function resolvePagePattern(styles: SiteStyles, pageSlug: string): PagePatternConfig {
  return readPagePatternOverride(styles.misc, pageSlug) ?? readSitePattern(styles.misc)
}

export function pagePatternScope(styles: SiteStyles, pageSlug: string): PagePatternScope {
  return readPagePatternOverride(styles.misc, pageSlug) ? 'page' : 'site'
}

export function countPagePatternOverrides(misc: SiteMisc): number {
  return Object.values(misc.pagePatternOverrides ?? {}).filter(value => value && isPagePatternId(value.pattern)).length
}

export function writePagePattern(
  misc: SiteMisc,
  pageSlug: string,
  scope: PagePatternScope,
  config: PagePatternConfig,
  options?: { replaceEveryPage?: boolean }
): SiteMisc {
  const next: PagePatternConfig = {
    pattern: config.pattern,
    loadStrength: clampPatternStrength(config.loadStrength),
    hoverStrength: clampPatternStrength(config.hoverStrength)
  }

  if (scope === 'page' && !options?.replaceEveryPage) {
    return {
      ...misc,
      pagePatternOverrides: {
        ...(misc.pagePatternOverrides ?? {}),
        [pageSlug]: next
      }
    }
  }

  if (options?.replaceEveryPage) {
    return {
      ...misc,
      pagePattern: next.pattern,
      pagePatternLoadStrength: next.loadStrength,
      pagePatternHoverStrength: next.hoverStrength,
      pagePatternOverrides: {}
    }
  }

  const overrides = { ...(misc.pagePatternOverrides ?? {}) }

  delete overrides[pageSlug]

  return {
    ...misc,
    pagePattern: next.pattern,
    pagePatternLoadStrength: next.loadStrength,
    pagePatternHoverStrength: next.hoverStrength,
    pagePatternOverrides: overrides
  }
}
