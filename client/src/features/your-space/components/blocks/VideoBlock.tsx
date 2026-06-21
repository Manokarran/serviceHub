'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { getOptimizedVideoUrl } from '@/lib/imagekit/urls'
import type { VideoBlockProps } from '../../types'
import { getMediaFrameSx } from '../../utils/mediaBlockHelpers'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  props: VideoBlockProps
}

export function VideoBlock({ props }: Props) {
  const theme = useTheme()
  const siteStyles = useSiteStyles()
  const frameSx = getMediaFrameSx(siteStyles.misc, 'none', props.borderRadius)
  const cornerRadius = props.borderRadius ?? siteStyles.misc.imageCornerRadius
  const optimizedSrc = props.src ? getOptimizedVideoUrl(props.src) : ''

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
        <Box sx={{ width: '100%', maxWidth: 720, ...frameSx }}>
          <Box
            component='video'
            src={optimizedSrc}
            autoPlay={props.autoplay}
            muted={props.muted}
            loop={props.loop}
            controls={props.controls}
            playsInline
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: '#000' }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            minHeight: 160,
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
          <Typography variant='body2'>Add a video in the properties panel</Typography>
        </Box>
      )}
    </Box>
  )
}
