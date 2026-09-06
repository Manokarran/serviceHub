import { keyframes } from '@mui/material/styles'

/**
 * The registration page renders its own dark canvas rather than the app theme, so the
 * first impression stays identical for every visitor regardless of their colour mode.
 */
export const REGISTER_PALETTE = {
  ink: '#04050B',
  inkSoft: '#080A14',
  surface: 'rgba(255, 255, 255, 0.045)',
  surfaceStrong: 'rgba(255, 255, 255, 0.075)',
  hairline: 'rgba(255, 255, 255, 0.1)',
  hairlineStrong: 'rgba(255, 255, 255, 0.18)',
  text: '#F5F7FF',
  textMuted: 'rgba(226, 232, 240, 0.68)',
  textFaint: 'rgba(203, 213, 225, 0.42)',
  violet: '#8B5CF6',
  violetSoft: '#C4B5FD',
  cyan: '#22D3EE',
  pink: '#F472B6',
  amber: '#FBBF24'
} as const

export const auroraDrift = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  33%  { transform: translate3d(4%, -3%, 0) scale(1.08); }
  66%  { transform: translate3d(-3%, 4%, 0) scale(0.96); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
`

export const gridPan = keyframes`
  0%   { background-position: 0 0, 0 0; }
  100% { background-position: 64px 64px, 64px 64px; }
`

export const shimmer = keyframes`
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`

export const borderSpin = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

export const rise = keyframes`
  from { opacity: 0; transform: translate3d(0, 18px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
`

export const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

export const caretBlink = keyframes`
  0%, 45%  { opacity: 1; }
  50%, 95% { opacity: 0; }
  100%     { opacity: 1; }
`

export const floatSoft = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0); }
  50%      { transform: translate3d(0, -8px, 0); }
`

/** Seamless horizontal drift for the register template rail. */
export const templateMarquee = keyframes`
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-50%, 0, 0); }
`

/** Staggered entrance so the page assembles itself instead of appearing all at once. */
export function enterSx(delayMs: number) {
  return {
    animation: `${rise} 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
    animationDelay: `${delayMs}ms`
  }
}
