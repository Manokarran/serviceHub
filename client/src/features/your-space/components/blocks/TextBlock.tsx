'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import type { TextBlockProps } from '../../types'
import {
  getDecorativeFontsStylesheetUrl,
  getTextVariant,
  getTextVariantShellSx,
  resolveTextBlockTypographySx,
  textVariantNeedsAttribution
} from '../../utils/textBlockVariantHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  props: TextBlockProps
}

export function TextBlock({ props }: Props) {
  const theme = useTheme()
  const siteStyles = useSiteStyles()
  const variant = getTextVariant(props)
  const textSx = resolveTextBlockTypographySx(props, siteStyles.fonts)
  const shellSx = getTextVariantShellSx(props, theme)
  const showAttribution = textVariantNeedsAttribution(variant)
  const showQuoteMark = variant === 'pullquote' || variant === 'testimonial' || variant === 'calligraphy'
  const needsDecorativeFonts =
    variant === 'quote' ||
    variant === 'pullquote' ||
    variant === 'testimonial' ||
    variant === 'calligraphy'

  return (
    <Box sx={shellSx}>
      {needsDecorativeFonts && <link rel='stylesheet' href={getDecorativeFontsStylesheetUrl()} />}
      {showQuoteMark && (
        <Typography
          aria-hidden
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: variant === 'calligraphy' ? '3.5rem' : '3rem',
            lineHeight: 0.8,
            color: props.accentColor || 'primary.main',
            opacity: 0.35,
            mb: 1,
            userSelect: 'none'
          }}
        >
          “
        </Typography>
      )}
      <Typography component='div' sx={textSx}>
        <InlineEditableText
          value={props.text}
          field='text'
          multiline
          placeholder={
            variant === 'testimonial' || variant === 'quote'
              ? 'Add a client quote…'
              : variant === 'calligraphy'
                ? 'Add a signature line…'
                : 'Add your text…'
          }
          sx={textSx as Record<string, unknown>}
        />
      </Typography>
      {showAttribution && (
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            alignItems:
              props.alignment === 'center'
                ? 'center'
                : props.alignment === 'right'
                  ? 'flex-end'
                  : 'flex-start'
          }}
        >
          <Typography
            component='div'
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: props.color,
              opacity: 0.9,
              letterSpacing: 0.01
            }}
          >
            <InlineEditableText
              value={props.cite ?? ''}
              field='cite'
              placeholder='Client name'
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: props.color,
                display: 'block'
              }}
            />
          </Typography>
          <Typography
            component='div'
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: props.color,
              opacity: 0.65
            }}
          >
            <InlineEditableText
              value={props.citeRole ?? ''}
              field='citeRole'
              placeholder='Role or company'
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: props.color,
                opacity: 0.85,
                display: 'block'
              }}
            />
          </Typography>
        </Box>
      )}
    </Box>
  )
}
