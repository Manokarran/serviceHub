'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import type { HeadingBlockProps } from '../../types'
import {
  getDecorativeFontsStylesheetUrl,
  getHeadingVariant,
  getHeadingVariantShellSx,
  resolveHeadingBlockTypographySx
} from '../../utils/textBlockVariantHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  props: HeadingBlockProps
}

const VARIANT_MAP = { 1: 'h2', 2: 'h4', 3: 'h5' } as const

export function HeadingBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const variant = VARIANT_MAP[props.level]
  const headingVariant = getHeadingVariant(props)
  const textSx = resolveHeadingBlockTypographySx(props, siteStyles.fonts)
  const shellSx = getHeadingVariantShellSx(props)

  return (
    <Box sx={shellSx}>
      {headingVariant === 'script' && (
        <link rel='stylesheet' href={getDecorativeFontsStylesheetUrl()} />
      )}
      <Typography component='div' variant={variant} sx={textSx}>
        <InlineEditableText value={props.text} field='text' placeholder='Add a heading…' sx={textSx as Record<string, unknown>} />
      </Typography>
    </Box>
  )
}
