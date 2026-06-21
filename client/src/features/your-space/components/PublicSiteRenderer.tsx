'use client'

import Box from '@mui/material/Box'

import { DEFAULT_SITE_STYLES } from '../constants/siteStylePresets'
import type { Block } from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { BlockRenderer } from './blocks/BlockRenderer'
import { SiteStylesScope } from './SiteStylesScope'

type Props = {
  blocks: Block[]
  siteStyles?: SiteStyles | null
}

export function PublicSiteRenderer({ blocks, siteStyles }: Props) {
  const styles = siteStyles ?? DEFAULT_SITE_STYLES

  return (
    <SiteStylesScope siteStyles={styles}>
      <Box component='main' sx={{ minHeight: '100vh', width: '100%' }}>
        {blocks.map(block => (
          <BlockRenderer key={block.id} block={block} preview />
        ))}
      </Box>
    </SiteStylesScope>
  )
}
