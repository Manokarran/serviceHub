'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import type { TextBlockProps } from '../../types'
import { resolveTextTypographySx } from '../../utils/textTypographyHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  props: TextBlockProps
}

export function TextBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const textSx = {
    ...resolveTextTypographySx('body', siteStyles.fonts, props.typography),
    color: props.color,
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
