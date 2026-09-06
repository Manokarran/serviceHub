/**
 * Splashy / Fancy — register-page energy as a site theme.
 * Plain data only — safe to import from server actions and AI mappers.
 */
export const SPLASHY_PALETTE = {
  ink: '#04050B',
  surface: '#0A0C16',
  surfaceLift: '#12141F',
  hairline: 'rgba(255, 255, 255, 0.12)',
  text: '#F5F7FF',
  textMuted: 'rgba(226, 232, 240, 0.68)',
  violet: '#8B5CF6',
  violetSoft: '#C4B5FD',
  cyan: '#22D3EE',
  pink: '#F472B6',
  accent: '#A78BFA'
} as const

export const SPLASHY_BORDER_GRADIENT = `linear-gradient(115deg, ${SPLASHY_PALETTE.violet}, ${SPLASHY_PALETTE.cyan}, ${SPLASHY_PALETTE.pink}, ${SPLASHY_PALETTE.violet})`

export const SPLASHY_BUTTON_GRADIENT = `linear-gradient(100deg, ${SPLASHY_PALETTE.violetSoft}, ${SPLASHY_PALETTE.cyan} 55%, ${SPLASHY_PALETTE.violetSoft})`

export const SPLASHY_TITLE_GRADIENT = `linear-gradient(100deg, ${SPLASHY_PALETTE.violetSoft}, ${SPLASHY_PALETTE.cyan} 45%, ${SPLASHY_PALETTE.pink} 80%, ${SPLASHY_PALETTE.violetSoft})`

export function isSplashyTheme(themeId: string | undefined | null): boolean {
  return themeId === 'splashy'
}
