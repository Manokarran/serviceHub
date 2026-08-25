'use client'

import Box from '@mui/material/Box'

import { DEFAULT_SITE_STYLES } from '../constants/siteStylePresets'
import type { Block } from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { mergeSiteStyles } from '../utils/siteStylesHelpers'
import { siteCanvasContainerSx } from '../utils/siteResponsiveHelpers'
import { SiteStylesScope } from './SiteStylesScope'
import { SitePageBackgroundLayer } from './SitePageBackgroundLayer'
import { BlockRenderer } from './blocks/BlockRenderer'

type Props = {
  blocks: Block[]
  siteStyles?: SiteStyles | null

  /** When false, the page sizes to its content. Use inside scaled preview frames. */
  fillViewport?: boolean
}

export function PublicSiteRenderer({ blocks, siteStyles, fillViewport = true }: Props) {
  const styles = siteStyles ? mergeSiteStyles(siteStyles, DEFAULT_SITE_STYLES) : DEFAULT_SITE_STYLES

  return (
    <SiteStylesScope siteStyles={styles}>
      <Box
        component='main'
        sx={{
          position: 'relative',
          minHeight: fillViewport ? '100vh' : undefined,
          width: '100%',
          backgroundColor: styles.colors.background,
          ...siteCanvasContainerSx()
        }}
      >
        <SitePageBackgroundLayer />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {blocks.filter(block => Boolean(block?.id && block?.type)).map(block => (
            <BlockRenderer key={block.id} block={block} preview />
          ))}
        </Box>
      </Box>
    </SiteStylesScope>
  )
}
