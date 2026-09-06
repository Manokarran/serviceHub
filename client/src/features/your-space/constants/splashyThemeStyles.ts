import type { SxProps, Theme } from '@mui/material/styles'

import { SITE_BUTTON_ACTIVE_SX, SITE_BUTTON_HOVER_SX } from '../utils/siteInteractiveHelpers'
import { SPLASHY_BUTTON_GRADIENT, SPLASHY_PALETTE } from './splashyTheme'

/** Primary CTA — register “Build my site” energy. */
export function getSplashyPrimaryButtonSx(base: SxProps<Theme>): SxProps<Theme> {
  return {
    ...base,
    color: SPLASHY_PALETTE.ink,
    border: 'none',
    backgroundImage: SPLASHY_BUTTON_GRADIENT,
    backgroundSize: '200% 100%',
    backgroundColor: 'transparent',
    animation: 'splashyShimmer 3s linear infinite',
    boxShadow: '0 10px 28px rgba(139, 92, 246, 0.35)',
    '@keyframes splashyShimmer': {
      '0%': { backgroundPosition: '0% 50%' },
      '100%': { backgroundPosition: '200% 50%' }
    },
    '&&': {
      color: SPLASHY_PALETTE.ink,
      border: 'none',
      backgroundImage: SPLASHY_BUTTON_GRADIENT,
      backgroundSize: '200% 100%',
      backgroundColor: 'transparent',
      boxShadow: '0 10px 28px rgba(139, 92, 246, 0.35)'
    },
    '&:hover': {
      ...SITE_BUTTON_HOVER_SX,
      filter: 'brightness(1.08)',
      boxShadow: '0 16px 36px rgba(34, 211, 238, 0.4), 0 0 0 4px rgba(139, 92, 246, 0.12)'
    },
    '&&:hover': {
      ...SITE_BUTTON_HOVER_SX,
      color: SPLASHY_PALETTE.ink,
      border: 'none',
      filter: 'brightness(1.08)',
      backgroundImage: SPLASHY_BUTTON_GRADIENT,
      backgroundSize: '200% 100%',
      boxShadow: '0 16px 36px rgba(34, 211, 238, 0.4), 0 0 0 4px rgba(139, 92, 246, 0.12)'
    },
    '&.Mui-disabled, &&.Mui-disabled': {
      opacity: 0.45,
      color: SPLASHY_PALETTE.ink,
      filter: 'none',
      backgroundImage: SPLASHY_BUTTON_GRADIENT,
      boxShadow: 'none'
    },
    '&:active': SITE_BUTTON_ACTIVE_SX
  }
}

/** Outline / secondary — thin gradient glow border. */
export function getSplashyOutlineButtonSx(base: SxProps<Theme>): SxProps<Theme> {
  return {
    ...base,
    color: SPLASHY_PALETTE.text,
    border: '1px solid rgba(196, 181, 253, 0.45)',
    backgroundColor: 'rgba(10, 12, 22, 0.55)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.12), 0 8px 24px rgba(0, 0, 0, 0.35)',
    '&&': {
      color: SPLASHY_PALETTE.text,
      border: '1px solid rgba(196, 181, 253, 0.45)',
      backgroundColor: 'rgba(10, 12, 22, 0.55)',
      boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.12), 0 8px 24px rgba(0, 0, 0, 0.35)'
    },
    '&:hover': {
      ...SITE_BUTTON_HOVER_SX,
      borderColor: SPLASHY_PALETTE.cyan,
      backgroundColor: 'rgba(139, 92, 246, 0.16)',
      boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.35), 0 12px 32px rgba(139, 92, 246, 0.28)'
    },
    '&&:hover': {
      ...SITE_BUTTON_HOVER_SX,
      color: SPLASHY_PALETTE.text,
      borderColor: SPLASHY_PALETTE.cyan,
      backgroundColor: 'rgba(139, 92, 246, 0.16)',
      boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.35), 0 12px 32px rgba(139, 92, 246, 0.28)'
    },
    '&.Mui-disabled, &&.Mui-disabled': {
      opacity: 0.45,
      color: SPLASHY_PALETTE.textMuted,
      border: '1px solid rgba(196, 181, 253, 0.25)',
      backgroundColor: 'transparent',
      boxShadow: 'none'
    },
    '&:active': SITE_BUTTON_ACTIVE_SX
  }
}
