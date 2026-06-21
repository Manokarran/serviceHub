'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { HeaderBlockProps } from '../../types'
import { getFixedBlockShellSx } from '../../utils/mediaBlockHelpers'
import { useSiteStyles } from '../SiteStylesScope'
import { getChromeJustify, getHorizontalOrder, getNavJustify, SiteBrandLogo } from './SiteBrandLogo'

type Props = {
  props: HeaderBlockProps
}

export function HeaderBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const isVertical = props.layout === 'vertical'
  const order = getHorizontalOrder(props.logoPosition)

  return (
    <Box sx={getFixedBlockShellSx('header', props.fixed)}>
      <Box
        component='header'
        sx={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: isVertical ? 'center' : 'center',
          justifyContent: isVertical ? 'center' : 'space-between',
          gap: isVertical ? 2 : 0,
          flexWrap: isVertical ? 'nowrap' : 'wrap',
          px: 4,
          py: isVertical ? 3 : 2,
          backgroundColor: props.backgroundColor,
          color: props.textColor,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
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
              sx={{
                fontFamily: siteStyles.fonts.bodyFamily,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'inherit',
                textDecoration: 'none',
                opacity: 0.85,
                '&:hover': { opacity: 1 }
              }}
            >
              {link.label}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
