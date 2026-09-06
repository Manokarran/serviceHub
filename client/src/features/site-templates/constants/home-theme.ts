/**
 * Home dashboard accents — matched to the register “agency” gradient
 * (periwinkle → cyan → violet → pink) so landing and home feel like one product.
 */
export const HOME_PALETTE = {
  deep: '#2E1065',
  dark: '#5B21B6',
  accent: '#8B5CF6',
  soft: '#C4B5FD',
  periwinkle: '#A0C4FF',
  cyan: '#45D1FF',
  pink: '#F687B3',
  magenta: '#F472B6',
  sky: '#ECFEFF',
  ink: '#0F172A'
} as const

/** Welcome banner wash used on the home hero card. */
export const HOME_HERO_GRADIENT = `
  radial-gradient(1100px 320px at -6% -34%, rgba(255,255,255,0.22) 0%, transparent 58%),
  radial-gradient(820px 280px at 108% -10%, rgba(69,209,255,0.45) 0%, transparent 54%),
  radial-gradient(640px 240px at 70% 120%, rgba(246,135,179,0.32) 0%, transparent 55%),
  linear-gradient(118deg, ${HOME_PALETTE.cyan} 0%, ${HOME_PALETTE.deep} 28%, ${HOME_PALETTE.dark} 52%, ${HOME_PALETTE.accent} 78%, ${HOME_PALETTE.pink} 100%)
`

/** Animated border wash for the Build with AI card. */
export const HOME_AI_BORDER_GRADIENT = `linear-gradient(115deg, ${HOME_PALETTE.periwinkle}, ${HOME_PALETTE.cyan}, ${HOME_PALETTE.accent}, ${HOME_PALETTE.pink}, ${HOME_PALETTE.periwinkle})`

/** Primary AI CTA fill (purple → pink, as on the home screenshot). */
export const HOME_AI_BUTTON_GRADIENT = `linear-gradient(115deg, ${HOME_PALETTE.dark}, ${HOME_PALETTE.accent}, ${HOME_PALETTE.pink}, ${HOME_PALETTE.magenta})`

/** Section marker rail next to home headings. */
export const HOME_SECTION_ACCENT = `linear-gradient(180deg, ${HOME_PALETTE.accent} 0%, ${HOME_PALETTE.cyan} 100%)`
