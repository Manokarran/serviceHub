'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { getOptimizedImageUrl } from '@/lib/imagekit/urls'
import type { LogoPosition } from '../../types'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  logoText: string
  logoUrl: string
  textColor: string
}

export function SiteBrandLogo({ logoText, logoUrl, textColor }: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const optimizedLogo = logoUrl ? getOptimizedImageUrl(logoUrl, { width: 320, height: 120, quality: 85 }) : ''
  const showText = Boolean(logoText) || editContext !== null
  const logoTextSx = {
    fontFamily: siteStyles.fonts.headingFamily,
    fontWeight: siteStyles.fonts.headingWeight,
    color: textColor,
    lineHeight: 1.2,
    display: 'block'
  }

  if (!optimizedLogo && !showText) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {optimizedLogo && (
        <Box
          component='img'
          src={optimizedLogo}
          alt={logoText || 'Logo'}
          sx={{ maxHeight: 40, width: 'auto', display: 'block', objectFit: 'contain', flexShrink: 0 }}
        />
      )}
      {showText && (
        <Typography variant='h6' component='div' sx={logoTextSx}>
          <InlineEditableText value={logoText} field='logoText' placeholder='Logo' sx={logoTextSx} />
        </Typography>
      )}
    </Box>
  )
}

export function getChromeJustify(logoPosition: LogoPosition, isVertical: boolean): string {
  if (isVertical) {
    return 'center'
  }

  if (logoPosition === 'center') {
    return 'center'
  }

  if (logoPosition === 'right') {
    return 'flex-end'
  }

  return 'flex-start'
}

export function getNavJustify(logoPosition: LogoPosition, isVertical: boolean): string {
  if (isVertical) {
    return 'center'
  }

  if (logoPosition === 'center') {
    return 'center'
  }

  if (logoPosition === 'right') {
    return 'flex-start'
  }

  return 'flex-end'
}

export function getHorizontalOrder(logoPosition: LogoPosition): { logo: number; nav: number } {
  if (logoPosition === 'right') {
    return { logo: 2, nav: 1 }
  }

  return { logo: 1, nav: 2 }
}
