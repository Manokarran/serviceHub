'use client'

import { useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

import type { HeaderBlockProps } from '../../types'
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
import { getChromeJustify, getHorizontalOrder, getNavJustify, SiteBrandLogo } from './SiteBrandLogo'
import { ChromeBlockBackground } from './ChromeBlockBackground'
import { siteCanvasBelow } from '../../utils/siteResponsiveHelpers'

type Props = {
  props: HeaderBlockProps
}

export function HeaderBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const isVertical = props.layout === 'vertical'
  const order = getHorizontalOrder(props.logoPosition)
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null)
  const [shellEl, setShellEl] = useState<HTMLElement | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const isSticky = Boolean(props.fixed)
  const scrolled = useStickyChromeScroll(isSticky, shellEl)
  const navLinks = normalizeNavLinks(props.navLinks)
  const textColor = typeof props.textColor === 'string' && props.textColor ? props.textColor : '#111827'
  const lightText = textColor.toLowerCase() === '#ffffff' || textColor.toLowerCase() === 'white'
  const submenuBg = lightText ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.94)'
  const submenuBorder = lightText ? alpha('#ffffff', 0.14) : alpha('#0f172a', 0.12)
  const submenuHover = lightText ? alpha('#ffffff', 0.12) : alpha('#0f172a', 0.08)

  const fonts = normalizeSiteFonts(siteStyles.fonts)
  const navLinkSx = {
    ...resolveTextTypographyValues('nav', fonts, props.navTypography),
    color: 'inherit',
    ...getSiteNavLinkSx()
  } as SxProps<Theme>

  const updateNavLabel = (index: number, label: string) => {
    editContext?.updateProps({
      navLinks: navLinks.map((link, i) => (i === index ? { ...link, label } : link))
    })
  }
  const updateChildNavLabel = (index: number, childIndex: number, label: string) => {
    editContext?.updateProps({
      navLinks: navLinks.map((link, i) =>
        i === index
          ? {
              ...link,
              children: (link.children ?? []).map((child, ci) => (ci === childIndex ? { ...child, label } : child))
            }
          : link
      )
    })
  }

  useEffect(() => {
    const onDocPointerDown = (event: PointerEvent) => {
      if (!navRef.current) {
        return
      }

      if (!navRef.current.contains(event.target as Node)) {
        setOpenMenuIndex(null)
      }
    }

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuIndex(null)
      }
    }

    document.addEventListener('pointerdown', onDocPointerDown)
    document.addEventListener('keydown', onEsc)

    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  return (
    <Box ref={setShellEl} sx={getFixedBlockShellSx('header', isSticky, scrolled)}>
      <Box sx={getStickyChromeFloatShadowSx(isSticky && scrolled, props.borderRadius)}>
        <ChromeBlockBackground
          component='header'
          props={props}
          fallbackColor='#ffffff'
          sx={{
            color: textColor,
            ...getStickyChromeBarSx({
              scrolled: isSticky && scrolled,
              borderRadius: props.borderRadius,
              edge: 'bottom'
            })
          }}
          contentSx={{
            display: 'flex',
            flexDirection: isVertical ? 'column' : { xs: 'column', sm: 'row' },
            alignItems: isVertical ? 'center' : 'center',
            justifyContent: isVertical ? 'center' : 'space-between',
            gap: isVertical ? 2 : 0,
            flexWrap: 'wrap',
            px: { xs: 2, sm: 4 },
            py: isVertical ? 3 : isSticky && scrolled ? 1.5 : 2,
            transition: 'padding 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            ...(!isVertical
              ? siteCanvasBelow({
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'stretch',
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

        <Stack
          ref={navRef}
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
          {navLinks.map((link, index) => {
            const children = link.children ?? []
            const isOpen = openMenuIndex === index

            return (
              <Box
                key={`${link.label}-${index}`}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  pb: 1.25,
                  mb: -1.25,
                  zIndex: 2,
                  '& [data-nav-children]': {
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
                    transition:
                      'opacity 240ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1), visibility 220ms'
                  }
                }}
              >
                <Typography
                  component={SitePageLink}
                  href={link?.href || '#'}
                  onClick={event => {
                    if (children.length > 0) {
                      event.preventDefault()
                      setOpenMenuIndex(current => (current === index ? null : index))
                    } else {
                      setOpenMenuIndex(null)
                    }
                  }}
                  aria-expanded={children.length > 0 ? isOpen : undefined}
                  aria-haspopup={children.length > 0 ? 'menu' : undefined}
                  sx={navLinkSx}
                >
                  <InlineEditableText
                    value={link.label}
                    placeholder='Link'
                    sx={{ font: 'inherit', color: 'inherit' }}
                    onCommit={label => updateNavLabel(index, label)}
                  />
                  {children.length > 0 && (
                    <i
                      className='ri-arrow-down-s-line'
                      style={{
                        marginLeft: 6,
                        fontSize: '0.9rem',
                        transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  )}
                </Typography>
                {children.length > 0 && (
                  <Box
                    data-nav-children
                    role='menu'
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      mt: 0.75,
                      minWidth: 250,
                      py: 1,
                      px: 0.75,
                      borderRadius: 2,
                      border: `1px solid ${submenuBorder}`,
                      backgroundColor: submenuBg,
                      backdropFilter: 'blur(12px) saturate(1.2)',
                      boxShadow: lightText
                        ? '0 18px 45px rgba(2, 6, 23, 0.4)'
                        : '0 16px 40px rgba(15, 23, 42, 0.18)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.45,
                      opacity: 0,
                      visibility: 'hidden',
                      pointerEvents: 'none',
                      transform: 'translateY(-8px) scale(0.97)',
                      transformOrigin: 'top left',
                      transition:
                        'opacity 240ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1), visibility 220ms',
                      zIndex: 20,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -12,
                        left: 0,
                        right: 0,
                        height: 14
                      }
                    }}
                  >
                    {children.map((child, childIndex) => (
                      <Typography
                        key={`${link.label}-${index}-child-${childIndex}`}
                        component={SitePageLink}
                        href={child?.href || '#'}
                        sx={{
                          ...navLinkSx,
                          py: 0.8,
                          px: 1.05,
                          borderRadius: 1.25,
                          fontSize: Math.max(12, fonts.navSize - 1),
                          opacity: 0.95,
                          lineHeight: 1.35,
                          '&::after': { display: 'none !important' },
                          '&:hover': {
                            opacity: 1,
                            transform: 'translateY(0)',
                            backgroundColor: submenuHover
                          }
                        } as SxProps<Theme>}
                      >
                        <InlineEditableText
                          value={child.label}
                          placeholder='Child link'
                          sx={{ font: 'inherit', color: 'inherit' }}
                          onCommit={label => updateChildNavLabel(index, childIndex, label)}
                        />
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            )
          })}
        </Stack>
      </ChromeBlockBackground>
      </Box>
    </Box>
  )
}
