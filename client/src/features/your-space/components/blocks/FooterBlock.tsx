'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { FooterBlockProps } from '../../types'
import { applyBackgroundAlpha, getBlockBackgroundOpacity } from '../../utils/sectionStyleHelpers'
import { getFixedBlockShellSx } from '../../utils/mediaBlockHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { useSiteStyles } from '../SiteStylesScope'
import { getChromeJustify, getHorizontalOrder, getNavJustify, SiteBrandLogo } from './SiteBrandLogo'

type Props = {
  props: FooterBlockProps
}

export function FooterBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const isVertical = props.layout === 'vertical'
  const order = getHorizontalOrder(props.logoPosition)

  const navLinkSx = {
    fontFamily: siteStyles.fonts.bodyFamily,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'inherit',
    textDecoration: 'none',
    opacity: 0.85,
    '&:hover': { opacity: 1 }
  }

  const copyrightSx = {
    fontFamily: siteStyles.fonts.bodyFamily,
    fontSize: '0.8125rem',
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
      <Box
        component='footer'
        sx={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: isVertical ? 'center' : 'center',
          justifyContent: isVertical ? 'center' : 'space-between',
          gap: isVertical ? 2 : 1.5,
          flexWrap: 'wrap',
          px: 4,
          py: isVertical ? 3 : 2.5,
          backgroundColor: applyBackgroundAlpha(props.backgroundColor, getBlockBackgroundOpacity(props)),
          color: props.textColor,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          ...(props.borderRadius ? { borderRadius: `${props.borderRadius}px`, overflow: 'hidden' } : {})
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
          <SiteBrandLogo logoText={props.logoText} logoUrl={props.logoUrl} textColor={props.textColor} />
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
                component='a'
                href={link.href || '#'}
                onClick={e => editContext && e.preventDefault()}
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
      </Box>
    </Box>
  )
}
