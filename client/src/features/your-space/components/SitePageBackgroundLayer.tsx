'use client'

import Box from '@mui/material/Box'

import { DEFAULT_HERO_SPLIT_VISUAL_ANIMATION } from '../constants/heroVisual'
import { useSiteStyles } from './SiteStylesScope'
import { HeroVisualPanel } from './blocks/HeroVisualPanel'
import { resolveSitePageVisualColors, shouldRenderSitePageBackground } from '../utils/sitePageVisualHelpers'

export function SitePageBackgroundLayer() {
  const siteStyles = useSiteStyles()

  if (!shouldRenderSitePageBackground(siteStyles)) {
    return null
  }

  const colors = resolveSitePageVisualColors(siteStyles)
  const animation = siteStyles.misc.pageSplitVisualAnimation ?? DEFAULT_HERO_SPLIT_VISUAL_ANIMATION

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: siteStyles.colors.background
      }}
    >
      <HeroVisualPanel
        animation={animation}
        colorStart={colors.start}
        colorEnd={colors.end}
        mode='section-background'
      />
    </Box>
  )
}
