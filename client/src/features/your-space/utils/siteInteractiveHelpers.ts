import type { SxProps, Theme } from '@mui/material/styles'

export const SITE_INTERACTIVE_TRANSITION =
  'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'

export const SITE_BUTTON_HOVER_SX = { transform: 'translateY(-2px)' }

export const SITE_BUTTON_ACTIVE_SX = {
  transform: 'translateY(0) scale(0.98)',
  transitionDuration: '0.1s'
}

export function getSiteButtonInteractiveSx(): SxProps<Theme> {
  return {
    cursor: 'pointer',
    transition: SITE_INTERACTIVE_TRANSITION,
    '&:hover': SITE_BUTTON_HOVER_SX,
    '&:active': SITE_BUTTON_ACTIVE_SX
  }
}

export function getSiteNavLinkSx(): SxProps<Theme> {
  return {
    cursor: 'pointer',
    position: 'relative',
    display: 'inline-block',
    textDecoration: 'none',
    transition: SITE_INTERACTIVE_TRANSITION,
    opacity: 0.85,
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: -3,
      height: 2,
      borderRadius: 1,
      backgroundColor: 'currentColor',
      transform: 'scaleX(0)',
      transformOrigin: 'left center',
      transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 0.65
    },
    '&:hover': {
      opacity: 1,
      transform: 'translateY(-1px)',
      '&::after': {
        transform: 'scaleX(1)'
      }
    },
    '&:active': {
      transform: 'translateY(0)',
      opacity: 0.92
    }
  }
}

export function getSiteLogoLinkSx(): SxProps<Theme> {
  return {
    cursor: 'pointer',
    display: 'inline-flex',
    textDecoration: 'none',
    transition: SITE_INTERACTIVE_TRANSITION,
    '&:hover': {
      opacity: 0.88,
      transform: 'scale(1.02)'
    },
    '&:active': {
      transform: 'scale(0.98)',
      opacity: 1
    }
  }
}
