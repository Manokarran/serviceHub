'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { HeaderBlockProps } from '../../types'
import { applyBackgroundAlpha, getBlockBackgroundOpacity } from '../../utils/sectionStyleHelpers'
import { getFixedBlockShellSx } from '../../utils/mediaBlockHelpers'
import { normalizeSiteFonts } from '../../utils/siteStylesHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { useSiteStyles } from '../SiteStylesScope'
import { getChromeJustify, getHorizontalOrder, getNavJustify, SiteBrandLogo } from './SiteBrandLogo'
import { siteCanvasBelow } from '../../utils/siteResponsiveHelpers'

type Props = {
  props: HeaderBlockProps
}

export function HeaderBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const isVertical = props.layout === 'vertical'
  const order = getHorizontalOrder(props.logoPosition)

  const fonts = normalizeSiteFonts(siteStyles.fonts)
  const navLinkSx = {
    fontFamily: fonts.bodyFamily,
    fontSize: fonts.navSize,
    fontWeight: 500,
    color: 'inherit',
    textDecoration: 'none',
    opacity: 0.85,
    '&:hover': { opacity: 1 }
  }

  const updateNavLabel = (index: number, label: string) => {
    editContext?.updateProps({
      navLinks: props.navLinks.map((link, i) => (i === index ? { ...link, label } : link))
    })
  }

  return (
    <Box sx={getFixedBlockShellSx('header', props.fixed)}>
      <Box
        component='header'
        sx={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : { xs: 'column', sm: 'row' },
          alignItems: isVertical ? 'center' : 'center',
          justifyContent: isVertical ? 'center' : 'space-between',
          gap: isVertical ? 2 : 0,
          flexWrap: 'wrap',
          px: { xs: 2, sm: 4 },
          py: isVertical ? 3 : 2,
          backgroundColor: applyBackgroundAlpha(props.backgroundColor, getBlockBackgroundOpacity(props)),
          color: props.textColor,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          ...(props.borderRadius ? { borderRadius: `${props.borderRadius}px`, overflow: 'hidden' } : {}),
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
          <SiteBrandLogo logoText={props.logoText} logoUrl={props.logoUrl} textColor={props.textColor} />
        </Box>

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
      </Box>
    </Box>
  )
}
