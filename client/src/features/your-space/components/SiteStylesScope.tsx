'use client'

import { createContext, useContext, type ReactNode } from 'react'

import Box from '@mui/material/Box'

import { DEFAULT_SITE_STYLES } from '../constants/siteStylePresets'
import type { SiteStyles } from '../types/siteStyles'
import { getGoogleFontsUrl, normalizeSiteFonts, siteStylesToCssVars } from '../utils/siteStylesHelpers'

const SiteStylesContext = createContext<SiteStyles>(DEFAULT_SITE_STYLES)

export function useSiteStyles() {
  return useContext(SiteStylesContext)
}

type Props = {
  siteStyles: SiteStyles
  children: ReactNode
}

export function SiteStylesScope({ siteStyles, children }: Props) {
  const fonts = normalizeSiteFonts(siteStyles.fonts)
  const fontUrl = getGoogleFontsUrl(fonts)

  return (
    <SiteStylesContext.Provider value={siteStyles}>
      {fontUrl && <link rel='stylesheet' href={fontUrl} />}
      <Box
        sx={{
          ...siteStylesToCssVars(siteStyles.colors, fonts),
          fontFamily: fonts.bodyFamily,
          fontSize: fonts.bodySize,
          color: siteStyles.colors.text,
          backgroundColor: siteStyles.colors.background,
          minHeight: 'inherit',
          width: '100%'
        }}
      >
        {children}
      </Box>
    </SiteStylesContext.Provider>
  )
}
