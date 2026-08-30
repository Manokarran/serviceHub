'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { getDisplayImageUrl } from '@/lib/imagekit/urls'
import type { LogoBlockProps } from '../../types'
import { SitePageLink } from '../SitePageLink'
import { getSiteLogoLinkSx } from '../../utils/siteInteractiveHelpers'
import { siteCanvasBelow } from '../../utils/siteResponsiveHelpers'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  props: LogoBlockProps
}

export function LogoBlock({ props }: Props) {
  const theme = useTheme()
  const siteStyles = useSiteStyles()
  const optimizedSrc = props.src ? getDisplayImageUrl(props.src, 640, { quality: 92 }) : ''

  const logoImage = optimizedSrc ? (
    <Box
      component='img'
      src={optimizedSrc}
      alt={props.alt || 'Logo'}
      sx={{
        maxHeight: props.maxHeight,
        width: 'auto',
        height: 'auto',
        display: 'block',
        objectFit: 'contain'
      }}
    />
  ) : (
    <Box
      sx={{
        minWidth: 120,
        minHeight: props.maxHeight,
        px: 2,
        borderRadius: `${siteStyles.misc.imageCornerRadius}px`,
        border: '1px dashed',
        borderColor: alpha(theme.palette.text.primary, 0.18),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.disabled',
        backgroundColor: alpha(theme.palette.text.primary, 0.03)
      }}
    >
      <Typography variant='caption'>Upload logo</Typography>
    </Box>
  )

  return (
    <Box
      sx={{
        px: 4,
        py: 2,
        display: 'flex',
        justifyContent: props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start',
        ...siteCanvasBelow({ px: 2, py: 1.5 })
      }}
    >
      {props.link && optimizedSrc ? (
        <Box component={SitePageLink} href={props.link} sx={getSiteLogoLinkSx()}>
          {logoImage}
        </Box>
      ) : (
        logoImage
      )}
    </Box>
  )
}
