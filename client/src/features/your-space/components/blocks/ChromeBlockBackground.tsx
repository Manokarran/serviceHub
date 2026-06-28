'use client'

import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ElementType } from 'react'

import type { BlockBackgroundProps, SplitVisualConfig } from '../../types'
import { resolveHeroVisualColors } from '../../utils/heroVisualHelpers'
import { chromeHasMediaBackground, shouldRenderChromeBackgroundVisual } from '../../utils/chromeBlockHelpers'
import {
  getBlockBackgroundShellSx,
  getBlockFillOpacity,
  getPhotoAnimation,
  shouldRenderBlockBackgroundLayers
} from '../../utils/sectionStyleHelpers'
import { useSiteStyles } from '../SiteStylesScope'
import { BlockBackgroundLayers } from './BlockBackgroundLayers'
import { HeroVisualPanel } from './HeroVisualPanel'

type Props = {
  props: BlockBackgroundProps & SplitVisualConfig
  fallbackColor: string
  children: React.ReactNode
  component?: ElementType
  sx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
}

export function ChromeBlockBackground({
  props,
  fallbackColor,
  children,
  component = 'div',
  sx,
  contentSx
}: Props) {
  const siteStyles = useSiteStyles()
  const hasMedia = chromeHasMediaBackground(props)
  const fillOpacity = getBlockFillOpacity(props)
  const photoAnimation = hasMedia ? getPhotoAnimation(props, siteStyles.misc.imageHoverEffect) : 'none'
  const showStaticBackgroundLayers = shouldRenderBlockBackgroundLayers(props)
  const showBackgroundVisual = shouldRenderChromeBackgroundVisual(props)
  const visualColors = resolveHeroVisualColors(props, siteStyles.colors.accent)

  const mergedSx = [
    getBlockBackgroundShellSx(props, photoAnimation, fillOpacity, fallbackColor, {
      fillEnabled: showStaticBackgroundLayers
    }),
    { position: 'relative', overflow: 'hidden' },
    ...(sx ? [sx] : [])
  ] as SxProps<Theme>

  return (
    <Box component={component} sx={mergedSx}>
      {showBackgroundVisual && (
        <HeroVisualPanel
          animation={props.splitVisualAnimation}
          colorStart={visualColors.start}
          colorEnd={visualColors.end}
          mode='section-background'
        />
      )}
      {showStaticBackgroundLayers && (
        <BlockBackgroundLayers props={props} photoOpacity={fillOpacity} fallbackColor={fallbackColor} />
      )}
      <Box sx={{ position: 'relative', zIndex: 1, ...contentSx }}>{children}</Box>
    </Box>
  )
}
