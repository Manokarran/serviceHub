'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import type { TextBlockProps } from '../../types'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  props: TextBlockProps
}

export function TextBlock({ props }: Props) {
  const siteStyles = useSiteStyles()

  return (
    <Box sx={{ px: 4, py: 1, textAlign: props.alignment }}>
      <Typography
        sx={{
          fontFamily: siteStyles.fonts.bodyFamily,
          fontWeight: siteStyles.fonts.bodyWeight,
          fontSize: siteStyles.fonts.bodySize,
          color: props.color,
          lineHeight: 1.75,
          maxWidth: 720,
          mx: props.alignment === 'center' ? 'auto' : undefined
        }}
      >
        {props.text}
      </Typography>
    </Box>
  )
}
