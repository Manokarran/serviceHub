'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { ItServiceIcon, isRemixIconClass } from '@/components/IconPicker'
import { DEFAULT_LOGO_ICON_STYLE, type IconPickerStyle } from '@/components/iconPickerStyle'
import { getOptimizedImageUrl } from '@/lib/imagekit/urls'
import type { LogoPosition } from '../../types'
import { normalizeSiteFonts } from '../../utils/siteStylesHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  logoText: string
  logoUrl: string
  logoIcon?: string
  logoIconColor?: string
  logoIconSize?: number
  logoIconShowBackground?: boolean
  logoIconBackgroundColor?: string
  logoIconBorderRadius?: number
  textColor: string
}

function resolveLogoIconStyle(props: Props): IconPickerStyle {
  return {
    color: props.logoIconColor ?? props.textColor,
    size: props.logoIconSize ?? DEFAULT_LOGO_ICON_STYLE.size,
    showBackground: props.logoIconShowBackground ?? DEFAULT_LOGO_ICON_STYLE.showBackground,
    backgroundColor: props.logoIconBackgroundColor ?? DEFAULT_LOGO_ICON_STYLE.backgroundColor,
    borderRadius: props.logoIconBorderRadius ?? DEFAULT_LOGO_ICON_STYLE.borderRadius
  }
}

export function SiteBrandLogo({
  logoText,
  logoUrl,
  logoIcon,
  logoIconColor,
  logoIconSize,
  logoIconShowBackground,
  logoIconBackgroundColor,
  logoIconBorderRadius,
  textColor
}: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const optimizedLogo = logoUrl ? getOptimizedImageUrl(logoUrl, { width: 320, height: 120, quality: 85 }) : ''
  const showText = Boolean(logoText) || editContext !== null
  const iconStyle = resolveLogoIconStyle({
    logoText,
    logoUrl,
    logoIcon,
    logoIconColor,
    logoIconSize,
    logoIconShowBackground,
    logoIconBackgroundColor,
    logoIconBorderRadius,
    textColor
  })
  const showMuiIcon = Boolean(logoIcon) && !optimizedLogo && !isRemixIconClass(logoIcon)
  const fonts = normalizeSiteFonts(siteStyles.fonts)
  const logoTextSx = {
    fontFamily: fonts.headingFamily,
    fontWeight: fonts.headingWeight,
    fontSize: fonts.logoSize,
    color: textColor,
    lineHeight: 1.2,
    display: 'block'
  }
  const tileSize = Math.max(iconStyle.size + 12, 36)

  if (!optimizedLogo && !showText && !showMuiIcon) {
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
      {showMuiIcon && logoIcon && (
        <Box
          sx={{
            width: tileSize,
            height: tileSize,
            borderRadius: `${iconStyle.borderRadius}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: iconStyle.color,
            backgroundColor: iconStyle.showBackground ? alpha(iconStyle.backgroundColor, 0.12) : 'transparent',
            border: iconStyle.showBackground ? `1px solid ${alpha(iconStyle.backgroundColor, 0.18)}` : 'none'
          }}
        >
          <ItServiceIcon name={logoIcon} sx={{ fontSize: iconStyle.size }} />
        </Box>
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
