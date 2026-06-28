'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'

import type { FooterBlockProps } from '../../types'
import { getFixedBlockShellSx } from '../../utils/mediaBlockHelpers'
import { normalizeSiteFonts } from '../../utils/siteStylesHelpers'
import { resolveTextTypographyValues } from '../../utils/textTypographyHelpers'
import { getSiteNavLinkSx } from '../../utils/siteInteractiveHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { SitePageLink } from '../SitePageLink'
import { useSiteStyles } from '../SiteStylesScope'
import { getChromeJustify, getHorizontalOrder, getNavJustify, SiteBrandLogo } from './SiteBrandLogo'
import { ChromeBlockBackground } from './ChromeBlockBackground'
import { siteCanvasBelow } from '../../utils/siteResponsiveHelpers'

type Props = {
  props: FooterBlockProps
}

export function FooterBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const isVertical = props.layout === 'vertical'
  const order = getHorizontalOrder(props.logoPosition)

  const fonts = normalizeSiteFonts(siteStyles.fonts)
  const navLinkSx = {
    ...resolveTextTypographyValues('nav', fonts, props.navTypography),
    color: 'inherit',
    ...getSiteNavLinkSx()
  } as SxProps<Theme>

  const copyrightSx = {
    ...resolveTextTypographyValues('label', fonts, props.copyrightTypography),
    color: 'inherit',
    opacity: 0.75,
    display: 'block'
  }

  const updateNavLabel = (index: number, label: string) => {
    editContext?.updateProps({
      navLinks: props.navLinks.map((link, i) => (i === index ? { ...link, label } : link))
    })
  }

  return (
    <Box sx={getFixedBlockShellSx('footer', props.fixed)}>
      <ChromeBlockBackground
        component='footer'
        props={props}
        fallbackColor='#1a1a2e'
        sx={{
          color: props.textColor,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          ...(props.borderRadius ? { borderRadius: `${props.borderRadius}px` } : {})
        }}
        contentSx={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : { xs: 'column', sm: 'row' },
          alignItems: isVertical ? 'center' : 'center',
          justifyContent: isVertical ? 'center' : 'space-between',
          gap: isVertical ? 2 : 1.5,
          flexWrap: 'wrap',
          px: { xs: 2, sm: 4 },
          py: isVertical ? 3 : 2.5,
          ...(!isVertical
            ? siteCanvasBelow({
                flexDirection: 'column',
                gap: 2,
                alignItems: 'center',
                textAlign: 'center'
              })
            : {})
        }}
      >
        <Box
          sx={{
            order: isVertical ? 0 : order.logo,
            display: 'flex',
            justifyContent: getChromeJustify(props.logoPosition, isVertical),
            flex: isVertical ? '0 0 auto' : props.logoPosition === 'center' ? '1 1 100%' : '0 0 auto',
            width: isVertical || props.logoPosition !== 'center' ? 'auto' : '100%'
          }}
        >
          <SiteBrandLogo
            logoText={props.logoText}
            logoUrl={props.logoUrl}
            logoIcon={props.logoIcon}
            logoIconColor={props.logoIconColor}
            logoIconSize={props.logoIconSize}
            logoIconShowBackground={props.logoIconShowBackground}
            logoIconBackgroundColor={props.logoIconBackgroundColor}
            logoIconBorderRadius={props.logoIconBorderRadius}
            textColor={props.textColor}
            typography={props.logoTypography}
          />
        </Box>

        {props.navLinks.length > 0 && (
          <Stack
            direction='row'
            spacing={3}
            component='nav'
            sx={{
              order: isVertical ? 0 : order.nav,
              flexWrap: 'wrap',
              justifyContent: getNavJustify(props.logoPosition, isVertical),
              rowGap: 1,
              flex: props.logoPosition === 'center' && !isVertical ? '1 1 100%' : '0 0 auto'
            }}
          >
            {props.navLinks.map((link, index) => (
              <Typography
                key={`${link.label}-${index}`}
                component={SitePageLink}
                href={link.href || '#'}
                sx={navLinkSx}
              >
                <InlineEditableText
                  value={link.label}
                  placeholder='Link'
                  sx={{ font: 'inherit', color: 'inherit' }}
                  onCommit={label => updateNavLabel(index, label)}
                />
              </Typography>
            ))}
          </Stack>
        )}

        <Typography
          component='div'
          sx={{
            order: isVertical ? 0 : 3,
            textAlign: isVertical ? 'center' : props.logoPosition === 'right' ? 'left' : 'right',
            flex: isVertical ? '0 0 auto' : '1 1 auto'
          }}
        >
          <InlineEditableText
            value={props.copyrightText}
            field='copyrightText'
            placeholder='© 2026 Your Company'
            sx={copyrightSx}
          />
        </Typography>
      </ChromeBlockBackground>
    </Box>
  )
}
