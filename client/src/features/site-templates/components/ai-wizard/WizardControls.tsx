'use client'

import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { SiteColors } from '@/features/your-space/types/siteStyles'
import {
  type ColorPalette,
  type FontPairing,
  type PersonalityPreview,
  googleFontFamily
} from '@/lib/ai-site-wizard/design-catalog'

/** Load the Google Fonts used by the specimen cards so previews render truthfully. */
export function useSpecimenFonts(stacks: string[]) {
  const href = useMemo(() => {
    const families = [...new Set(stacks.map(googleFontFamily).filter((name): name is string => Boolean(name)))]

    if (!families.length) {
      return null
    }

    const params = families.map(name => `family=${name.replace(/ /g, '+')}:wght@400;700`).join('&')

    return `https://fonts.googleapis.com/css2?${params}&display=swap`
  }, [stacks])

  useEffect(() => {
    if (!href || document.querySelector(`link[data-wizard-fonts="${href}"]`)) {
      return
    }

    const link = document.createElement('link')

    link.rel = 'stylesheet'
    link.href = href
    link.dataset.wizardFonts = href
    document.head.appendChild(link)
  }, [href])
}

export function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant='h6' sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography color='text.secondary' variant='body2'>
        {description}
      </Typography>
    </Box>
  )
}

export function FieldGroup({
  label,
  hint,
  action,
  children
}: {
  label: string
  hint?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography
            variant='overline'
            sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.primary', lineHeight: 1.6 }}
          >
            {label}
          </Typography>
          {hint ? (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: -0.5 }}>
              {hint}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  )
}

export function OptionGrid({ minWidth = 168, children }: { minWidth?: number; children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.25,
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`
      }}
    >
      {children}
    </Box>
  )
}

type OptionCardProps = {
  selected: boolean
  onSelect: () => void
  title: string
  subtitle?: string
  icon?: string
  visual?: ReactNode

  /** Renders the visual edge-to-edge above the label instead of inline. */
  visualFirst?: boolean
}

export function OptionCard({ selected, onSelect, title, subtitle, icon, visual, visualFirst }: OptionCardProps) {
  const theme = useTheme()

  return (
    <ButtonBase
      onClick={onSelect}
      focusRipple
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'start',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        backgroundColor: selected ? alpha(theme.palette.primary.main, 0.06) : theme.palette.background.paper,
        boxShadow: selected ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.14)}` : 'none',
        transition: theme.transitions.create(['border-color', 'box-shadow', 'transform', 'background-color'], {
          duration: 160
        }),
        position: 'relative',
        '&:hover': {
          borderColor: selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.55),
          transform: 'translateY(-2px)'
        }
      }}
    >
      {selected ? (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            insetInlineEnd: 8,
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            zIndex: 2
          }}
        >
          <i className='ri-check-line' />
        </Box>
      ) : null}

      {visualFirst && visual ? visual : null}

      <Box sx={{ p: 1.5, display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
        {icon ? (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.05rem',
              bgcolor: selected ? alpha(theme.palette.primary.main, 0.16) : alpha(theme.palette.text.primary, 0.05),
              color: selected ? 'primary.main' : 'text.secondary'
            }}
          >
            <i className={icon} />
          </Box>
        ) : null}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant='body2' sx={{ fontWeight: 600, lineHeight: 1.35 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.4 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {!visualFirst && visual ? <Box sx={{ px: 1.5, pb: 1.5 }}>{visual}</Box> : null}
    </ButtonBase>
  )
}

export function SwatchStrip({ colors, height = 26 }: { colors: string[]; height?: number }) {
  return (
    <Box sx={{ display: 'flex', borderRadius: 1, overflow: 'hidden', height }}>
      {colors.map((color, index) => (
        <Box key={`${color}-${index}`} sx={{ flex: 1, backgroundColor: color }} />
      ))}
    </Box>
  )
}

/** A tiny fake website used to show what a choice actually looks like. */
export function MiniSite({
  colors,
  headingFamily,
  radius = 8,
  weight = 700,
  letterSpacing = -0.02,
  uppercase = false,
  gradient,
  height = 96
}: {
  colors: Pick<SiteColors, 'background' | 'text' | 'accent' | 'swatch1'>
  headingFamily: string
  radius?: number
  weight?: number
  letterSpacing?: number
  uppercase?: boolean
  gradient?: [string, string]
  height?: number
}) {
  return (
    <Box
      sx={{
        height,
        px: 1.25,
        py: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        backgroundColor: colors.background,
        borderBottom: `1px solid ${alpha('#000', 0.08)}`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: radius > 12 ? '50%' : 0.5, backgroundColor: colors.accent }} />
        <Box sx={{ flex: 1 }} />
        {[0, 1, 2].map(key => (
          <Box key={key} sx={{ width: 10, height: 3, borderRadius: 4, backgroundColor: alpha(colors.text, 0.35) }} />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flex: 1 }}>
        <Box sx={{ flex: 1.4, minWidth: 0 }}>
          <Typography
            noWrap
            sx={{
              fontFamily: headingFamily,
              fontWeight: weight,
              letterSpacing: `${letterSpacing}em`,
              textTransform: uppercase ? 'uppercase' : 'none',
              fontSize: '0.8rem',
              lineHeight: 1.1,
              color: colors.text
            }}
          >
            Aa Headline
          </Typography>
          <Box sx={{ mt: 0.5, height: 3, width: '80%', borderRadius: 4, backgroundColor: alpha(colors.text, 0.22) }} />
          <Box sx={{ mt: 0.4, height: 3, width: '55%', borderRadius: 4, backgroundColor: alpha(colors.text, 0.16) }} />
          <Box
            sx={{
              mt: 0.75,
              width: 40,
              height: 11,
              borderRadius: `${Math.min(radius, 999)}px`,
              backgroundColor: colors.accent
            }}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            alignSelf: 'stretch',
            borderRadius: `${Math.min(radius, 20)}px`,
            background: gradient
              ? `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
              : alpha(colors.accent, 0.24)
          }}
        />
      </Box>
    </Box>
  )
}

export function PaletteCard({
  palette,
  mode,
  selected,
  onSelect
}: {
  palette: ColorPalette
  mode: 'light' | 'dark'
  selected: boolean
  onSelect: () => void
}) {
  const colors = mode === 'dark' ? palette.dark : palette.light

  return (
    <OptionCard
      selected={selected}
      onSelect={onSelect}
      title={palette.label}
      subtitle={palette.blurb}
      visualFirst
      visual={
        <Box>
          <Box
            sx={{
              height: 42,
              background: `linear-gradient(120deg, ${palette.gradientStart}, ${palette.gradientEnd})`
            }}
          />
          <SwatchStrip
            height={16}
            colors={[colors.swatch1, colors.swatch2, colors.swatch3, colors.swatch4, colors.swatch5]}
          />
        </Box>
      }
    />
  )
}

export function FontCard({
  pairing,
  colors,
  selected,
  onSelect
}: {
  pairing: FontPairing
  colors: Pick<SiteColors, 'background' | 'text'>
  selected: boolean
  onSelect: () => void
}) {
  return (
    <OptionCard
      selected={selected}
      onSelect={onSelect}
      title={pairing.label}
      subtitle={pairing.blurb}
      visualFirst
      visual={
        <Box sx={{ px: 1.5, pt: 1.5, pb: 1, backgroundColor: colors.background }}>
          <Typography
            noWrap
            sx={{
              fontFamily: pairing.headingFamily,
              fontWeight: pairing.headingWeight,
              letterSpacing: `${pairing.headingLetterSpacing}em`,
              fontSize: '1.5rem',
              lineHeight: 1.1,
              color: colors.text
            }}
          >
            Aa Bb Cc
          </Typography>
          <Typography
            noWrap
            sx={{
              fontFamily: pairing.bodyFamily,
              fontSize: '0.7rem',
              mt: 0.5,
              color: alpha(colors.text, 0.65)
            }}
          >
            The quick brown fox jumps over
          </Typography>
        </Box>
      }
    />
  )
}

export function PersonalityCard({
  meta,
  label,
  palette,
  mode,
  selected,
  onSelect
}: {
  meta: PersonalityPreview
  label: string
  palette: ColorPalette
  mode: 'light' | 'dark'
  selected: boolean
  onSelect: () => void
}) {
  const colors = mode === 'dark' ? palette.dark : palette.light

  return (
    <OptionCard
      selected={selected}
      onSelect={onSelect}
      title={label}
      subtitle={meta.blurb}
      visualFirst
      visual={
        <MiniSite
          colors={colors}
          headingFamily={meta.headingFamily}
          radius={meta.radius}
          weight={meta.weight}
          letterSpacing={meta.letterSpacing}
          uppercase={meta.uppercase}
          gradient={[palette.gradientStart, palette.gradientEnd]}
        />
      }
    />
  )
}
