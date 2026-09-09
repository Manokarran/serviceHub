'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'

import type { FooterBlockProps } from '../../types'
import { useStickyChromeScroll } from '../../hooks/useStickyHeaderScroll'
import { normalizeNavLinks } from '../../utils/blockMigration'
import {
  getFixedBlockShellSx,
  getStickyChromeBarSx,
  getStickyChromeFloatShadowSx
} from '../../utils/mediaBlockHelpers'
import { normalizeSiteFonts } from '../../utils/siteStylesHelpers'
import { resolveTextTypographyValues } from '../../utils/textTypographyHelpers'
import { getSiteNavLinkSx } from '../../utils/siteInteractiveHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { SitePageLink } from '../SitePageLink'
import { useSiteStyles } from '../SiteStylesScope'
import { getFooterChromePlacement, SiteBrandLogo } from './SiteBrandLogo'
import { ChromeBlockBackground } from './ChromeBlockBackground'
import { siteCanvasBelow } from '../../utils/siteResponsiveHelpers'

type Props = {
  props: FooterBlockProps
}

export function FooterBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const isVertical = props.layout === 'vertical'
  const [shellEl, setShellEl] = useState<HTMLElement | null>(null)
  const isSticky = Boolean(props.fixed)
  const scrolled = useStickyChromeScroll(isSticky, shellEl)
  const navLinks = normalizeNavLinks(props.navLinks)
  const hasNav = navLinks.length > 0
  const placement = getFooterChromePlacement(props.logoPosition, isVertical, hasNav)
  const stackedAlignSx = siteCanvasBelow({
    gridColumn: 'auto',
    justifyContent: 'center',
    justifySelf: 'center',
    textAlign: 'center',
    width: '100%'
  })

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
      navLinks: navLinks.map((link, i) => (i === index ? { ...link, label } : link))
    })
  }

  return (
    <Box ref={setShellEl} sx={getFixedBlockShellSx('footer', isSticky, scrolled)}>
      <Box sx={getStickyChromeFloatShadowSx(isSticky && scrolled, props.borderRadius)}>
        <ChromeBlockBackground
          component='footer'
          props={props}
          fallbackColor='#1a1a2e'
          sx={{
            color: props.textColor,
            ...getStickyChromeBarSx({
              scrolled: isSticky && scrolled,
              borderRadius: props.borderRadius,
              edge: 'top',
              edgeColor: 'rgba(255,255,255,0.08)'
            })
          }}
          contentSx={{
            width: '100%',
            px: { xs: 2, sm: 4 },
            py: isVertical ? 3 : isSticky && scrolled ? 1.75 : 2.5,
            transition: 'padding 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            ...(placement.stacked
              ? {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  textAlign: 'center'
                }
              : {
                  display: 'grid',
                  gridTemplateColumns: hasNav
                    ? 'minmax(0, 1fr) minmax(0, auto) minmax(0, 1fr)'
                    : 'minmax(0, 1fr) minmax(0, 1fr)',
                  alignItems: 'center',
                  columnGap: { sm: 3, md: 5 },
                  rowGap: 1.5,
                  ...siteCanvasBelow({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    textAlign: 'center'
                  })
                })
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: placement.stacked ? 'center' : props.logoPosition === 'right' ? 'flex-end' : 'flex-start',
              minWidth: 0,
              ...(!placement.stacked ? { gridColumn: placement.logoColumn } : {}),
              ...(!isVertical ? stackedAlignSx : {})
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

          {hasNav && (
            <Stack
              direction='row'
              spacing={3}
              component='nav'
              sx={{
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                rowGap: 1,
                minWidth: 0,
                ...(!placement.stacked ? { gridColumn: placement.navColumn, justifySelf: 'center' } : {}),
                ...(!isVertical ? stackedAlignSx : {})
              }}
            >
              {navLinks.map((link, index) => (
                <Typography
                  key={`${link.label}-${index}`}
                  component={SitePageLink}
                  href={link?.href || '#'}
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
              minWidth: 0,
              textAlign: placement.stacked ? 'center' : props.logoPosition === 'right' ? 'left' : 'right',
              ...(!placement.stacked ? { gridColumn: placement.copyrightColumn } : {}),
              ...(!isVertical ? stackedAlignSx : {})
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
    </Box>
  )
}
