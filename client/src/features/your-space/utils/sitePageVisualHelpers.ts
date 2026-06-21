import { DEFAULT_HERO_SPLIT_VISUAL_ANIMATION } from '../constants/heroVisual'
import type { SiteStyles } from '../types/siteStyles'
import { resolveHeroVisualColors } from './heroVisualHelpers'

export function resolveSitePageVisualColors(siteStyles: SiteStyles) {
  return resolveHeroVisualColors(
    {
      splitVisualColorStart: siteStyles.misc.pageSplitVisualColorStart,
      splitVisualColorEnd: siteStyles.misc.pageSplitVisualColorEnd
    },
    siteStyles.colors.background
  )
}

export function shouldRenderSitePageBackground(siteStyles: SiteStyles): boolean {
  const animation = siteStyles.misc.pageSplitVisualAnimation ?? DEFAULT_HERO_SPLIT_VISUAL_ANIMATION

  return animation !== 'static'
}
