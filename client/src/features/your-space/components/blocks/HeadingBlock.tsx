'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import type { HeadingBlockProps } from '../../types'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  props: HeadingBlockProps
}

const VARIANT_MAP = { 1: 'h2', 2: 'h4', 3: 'h5' } as const
const SIZE_MAP = { 1: '2rem', 2: '1.5rem', 3: '1.25rem' }

export function HeadingBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const variant = VARIANT_MAP[props.level]

  return (
    <Box sx={{ px: 4, py: 2, textAlign: props.alignment }}>
      <Typography
        variant={variant}
        sx={{
          fontFamily: siteStyles.fonts.headingFamily,
          fontWeight: siteStyles.fonts.headingWeight,
          letterSpacing: siteStyles.fonts.headingLetterSpacing,
          fontSize: `calc(${SIZE_MAP[props.level]} * ${siteStyles.fonts.headingScale})`,
          color: props.color
        }}
      >
        {props.text}
      </Typography>
    </Box>
  )
}
