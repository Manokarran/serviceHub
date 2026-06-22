'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { getOptimizedImageUrl } from '@/lib/imagekit/urls'
import type { ImageBlockProps } from '../../types'
import { getMediaFrameSx, getMediaOpacityFraction } from '../../utils/mediaBlockHelpers'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  props: ImageBlockProps
}

export function ImageBlock({ props }: Props) {
  const theme = useTheme()
  const siteStyles = useSiteStyles()
  const hoverEffect = props.hoverEffect ?? siteStyles.misc.imageHoverEffect
  const frameSx = getMediaFrameSx(siteStyles.misc, hoverEffect, props.borderRadius)
  const opacity = getMediaOpacityFraction(props.opacity)
  const cornerRadius = props.borderRadius ?? siteStyles.misc.imageCornerRadius
  const optimizedSrc = props.src ? getOptimizedImageUrl(props.src) : ''

  return (
    <Box
      sx={{
        px: 4,
        py: 2,
        display: 'flex',
        justifyContent: props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start'
      }}
    >
      {optimizedSrc ? (
        <Box sx={{ width: '100%', maxWidth: 720, opacity, ...frameSx }}>
          <Box
            component='img'
            className='media-block-image'
            src={optimizedSrc}
            alt={props.alt || 'Image'}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            minHeight: 160,
            opacity,
            borderRadius: `${cornerRadius}px`,
            border: '1px dashed',
            borderColor: alpha(theme.palette.text.primary, 0.18),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
            backgroundColor: alpha(theme.palette.text.primary, 0.03)
          }}
        >
          <Typography variant='body2'>Add an image in the properties panel</Typography>
        </Box>
      )}
    </Box>
  )
}
