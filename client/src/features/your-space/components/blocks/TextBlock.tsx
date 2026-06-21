'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import type { TextBlockProps } from '../../types'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  props: TextBlockProps
}

export function TextBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const textSx = {
    fontFamily: siteStyles.fonts.bodyFamily,
    fontWeight: siteStyles.fonts.bodyWeight,
    fontSize: siteStyles.fonts.bodySize,
    color: props.color,
    lineHeight: 1.75,
    maxWidth: 720,
    mx: props.alignment === 'center' ? 'auto' : undefined,
    display: 'block'
  }

  return (
    <Box sx={{ px: 4, py: 1, textAlign: props.alignment }}>
      <Typography component='div' sx={textSx}>
        <InlineEditableText
          value={props.text}
          field='text'
          multiline
          placeholder='Add your text…'
          sx={textSx}
        />
      </Typography>
    </Box>
  )
}
