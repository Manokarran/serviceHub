'use client'

import { useMemo } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  COLOR_PALETTES,
  CORNER_META,
  DENSITY_META,
  FONT_PAIRINGS,
  MOTION_META,
  PERSONALITY_META,
  getFontPairing,
  getPalette,
  resolvePaletteColors
} from '@/lib/ai-site-wizard/design-catalog'
import { buildFallbackDesignBrief } from '@/lib/ai-site-wizard/style-mapper'
import {
  AI_ANIMATION_LEVEL_LABELS,
  AI_ANIMATION_LEVELS,
  AI_COLOR_MODE_LABELS,
  AI_COLOR_MODES,
  AI_CORNER_STYLE_LABELS,
  AI_CORNER_STYLES,
  AI_FONT_CHOICE_LABELS,
  AI_HERO_STYLE_LABELS,
  AI_HERO_STYLES,
  AI_LAYOUT_DENSITIES,
  AI_LAYOUT_DENSITY_LABELS,
  AI_STYLE_PERSONALITIES,
  AI_STYLE_PERSONALITY_LABELS,
  type AiSiteWizardProfile
} from '@/lib/validators/ai-site-wizard.validator'

import {
  FieldGroup,
  FontCard,
  MiniSite,
  OptionCard,
  OptionGrid,
  PaletteCard,
  PersonalityCard,
  StepIntro,
  SwatchStrip,
  useSpecimenFonts
} from './WizardControls'

type Props = {
  profile: AiSiteWizardProfile
  update: <K extends keyof AiSiteWizardProfile>(key: K, value: AiSiteWizardProfile[K]) => void
}

const COLOR_MODE_META: Record<(typeof AI_COLOR_MODES)[number], { icon: string; blurb: string }> = {
  ai_pick: { icon: 'ri-sparkling-line', blurb: 'Whatever suits the brand' },
  light: { icon: 'ri-sun-line', blurb: 'Bright surfaces, dark text' },
  dark: { icon: 'ri-moon-line', blurb: 'Deep surfaces, light text' }
}

const HERO_META: Record<(typeof AI_HERO_STYLES)[number], { icon: string; blurb: string }> = {
  ai_pick: { icon: 'ri-sparkling-line', blurb: 'Best fit for your content' },
  centered: { icon: 'ri-align-center', blurb: 'Headline front and centre' },
  'split-left': { icon: 'ri-layout-right-line', blurb: 'Copy left, visual right' },
  'split-right': { icon: 'ri-layout-left-line', blurb: 'Visual left, copy right' }
}

export function LookFeelStep({ profile, update }: Props) {
  const theme = useTheme()

  // Palette preview follows colour choices only — not personality, so picking a style does not shift swatches.
  const previewPaletteId = profile.colorMood !== 'ai_pick' ? profile.colorMood : 'slate'
  const previewColorMode = profile.colorMode !== 'ai_pick' ? profile.colorMode : 'light'
  const previewPalette = getPalette(previewPaletteId)
  const previewColors = resolvePaletteColors(previewPaletteId, previewColorMode)

  // Font, spacing, and motion still resolve from the full profile when left on "Let AI choose".
  const resolved = useMemo(() => buildFallbackDesignBrief(profile), [profile])
  const previewFont = getFontPairing(resolved.fontPairingId)
  const personality = PERSONALITY_META[profile.stylePersonality]

  useSpecimenFonts(
    useMemo(
      () => [
        ...FONT_PAIRINGS.map(entry => entry.headingFamily),
        ...FONT_PAIRINGS.map(entry => entry.bodyFamily),
        ...Object.values(PERSONALITY_META).map(entry => entry.headingFamily)
      ],
      []
    )
  )

  const swatchPreviewMode = profile.colorMode === 'dark' ? 'dark' : 'light'

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 268px' },
        alignItems: 'start'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, minWidth: 0 }}>
        <StepIntro
          title='Design the look'
          description='Start with colour, then shape the personality. Anything left on "Let AI choose" is filled in by the art director when you generate.'
        />

        <FieldGroup label='Colour mode'>
          <OptionGrid minWidth={168}>
            {AI_COLOR_MODES.map(item => (
              <OptionCard
                key={item}
                selected={profile.colorMode === item}
                onSelect={() => update('colorMode', item)}
                icon={COLOR_MODE_META[item].icon}
                title={AI_COLOR_MODE_LABELS[item]}
                subtitle={COLOR_MODE_META[item].blurb}
              />
            ))}
          </OptionGrid>
        </FieldGroup>

        <FieldGroup label='Colour palette' hint='Shown in your selected colour mode'>
          <OptionGrid minWidth={166}>
            <OptionCard
              selected={profile.colorMood === 'ai_pick'}
              onSelect={() => update('colorMood', 'ai_pick')}
              icon='ri-sparkling-line'
              title='Let AI choose'
              subtitle='Picked to avoid the industry cliché'
              visualFirst
              visual={
                <Box
                  sx={{
                    height: 58,
                    background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    opacity: 0.85
                  }}
                />
              }
            />
            {COLOR_PALETTES.map(item => (
              <PaletteCard
                key={item.id}
                palette={item}
                mode={swatchPreviewMode}
                selected={profile.colorMood === item.id}
                onSelect={() => update('colorMood', item.id)}
              />
            ))}
          </OptionGrid>
        </FieldGroup>

        <FieldGroup
          label='Style personality'
          hint='Typography weight, corners, and overall tone — your palette stays as chosen above'
        >
          <OptionGrid minWidth={178}>
            {AI_STYLE_PERSONALITIES.map(item => (
              <PersonalityCard
                key={item}
                meta={PERSONALITY_META[item]}
                label={AI_STYLE_PERSONALITY_LABELS[item]}
                palette={previewPalette}
                mode={previewColorMode}
                selected={profile.stylePersonality === item}
                onSelect={() => update('stylePersonality', item)}
              />
            ))}
          </OptionGrid>
        </FieldGroup>

        <FieldGroup label='Typography' hint='Heading and body pairing'>
          <OptionGrid minWidth={176}>
            <OptionCard
              selected={profile.fontChoice === 'ai_pick'}
              onSelect={() => update('fontChoice', 'ai_pick')}
              icon='ri-sparkling-line'
              title={AI_FONT_CHOICE_LABELS.ai_pick}
              subtitle='Matched to your personality'
            />
            {FONT_PAIRINGS.map(item => (
              <FontCard
                key={item.id}
                pairing={item}
                colors={previewColors}
                selected={profile.fontChoice === item.id}
                onSelect={() => update('fontChoice', item.id)}
              />
            ))}
          </OptionGrid>
        </FieldGroup>

        <FieldGroup label='Motion' hint='Animated page background and section entrances'>
          <OptionGrid minWidth={172}>
            {AI_ANIMATION_LEVELS.map(item => (
              <OptionCard
                key={item}
                selected={profile.animationLevel === item}
                onSelect={() => update('animationLevel', item)}
                icon={MOTION_META[item].icon}
                title={AI_ANIMATION_LEVEL_LABELS[item]}
                subtitle={MOTION_META[item].blurb}
              />
            ))}
          </OptionGrid>
        </FieldGroup>

        <FieldGroup label='Spacing' hint='How much room each section gets'>
          <OptionGrid minWidth={168}>
            {AI_LAYOUT_DENSITIES.map(item => (
              <OptionCard
                key={item}
                selected={profile.layoutDensity === item}
                onSelect={() => update('layoutDensity', item)}
                icon={DENSITY_META[item].icon}
                title={AI_LAYOUT_DENSITY_LABELS[item]}
                subtitle={DENSITY_META[item].blurb}
              />
            ))}
          </OptionGrid>
        </FieldGroup>

        <FieldGroup label='Corners' hint='Buttons, cards, and images'>
          <OptionGrid minWidth={168}>
            {AI_CORNER_STYLES.map(item => (
              <OptionCard
                key={item}
                selected={profile.cornerStyle === item}
                onSelect={() => update('cornerStyle', item)}
                icon={CORNER_META[item].icon}
                title={AI_CORNER_STYLE_LABELS[item]}
                subtitle={CORNER_META[item].blurb}
              />
            ))}
          </OptionGrid>
        </FieldGroup>

        <FieldGroup label='Hero layout' hint='The first thing visitors see'>
          <OptionGrid minWidth={168}>
            {AI_HERO_STYLES.map(item => (
              <OptionCard
                key={item}
                selected={profile.heroStyle === item}
                onSelect={() => update('heroStyle', item)}
                icon={HERO_META[item].icon}
                title={AI_HERO_STYLE_LABELS[item]}
                subtitle={HERO_META[item].blurb}
              />
            ))}
          </OptionGrid>
        </FieldGroup>
      </Box>

      <Box
        sx={{
          position: { md: 'sticky' },
          top: { md: 0 },
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant='overline' sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
            Live preview
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.4 }}>
            A rough sketch of your choices. The AI refines this when it generates.
          </Typography>
        </Box>

        <MiniSite
          height={148}
          colors={previewColors}
          headingFamily={previewFont.headingFamily}
          radius={
            profile.cornerStyle === 'sharp'
              ? 0
              : profile.cornerStyle === 'round'
                ? 24
                : profile.cornerStyle === 'soft'
                  ? 10
                  : personality.radius
          }
          weight={previewFont.headingWeight}
          letterSpacing={previewFont.headingLetterSpacing}
          uppercase={personality.uppercase}
          gradient={[previewPalette.gradientStart, previewPalette.gradientEnd]}
        />

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Palette
            </Typography>
            <SwatchStrip
              height={22}
              colors={[
                previewColors.swatch1,
                previewColors.swatch2,
                previewColors.swatch3,
                previewColors.swatch4,
                previewColors.swatch5
              ]}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              size='small'
              variant='tonal'
              color='primary'
              label={profile.colorMood === 'ai_pick' ? 'Palette: AI will choose' : previewPalette.label}
            />
            <Chip size='small' variant='outlined' label={previewFont.label} />
            <Chip size='small' variant='outlined' label={`${previewColorMode} mode`} />
            <Chip size='small' variant='outlined' label={`${resolved.density} spacing`} />
            <Chip size='small' variant='outlined' label={resolved.motion} />
          </Box>

          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.info.main, 0.08),
              display: 'flex',
              gap: 1
            }}
          >
            <Box sx={{ color: 'info.main', mt: '2px' }}>
              <i className='ri-sparkling-line' />
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.45 }}>
              Anything set to <strong>Let AI choose</strong> gets decided by the art director using your business
              details — including a custom colour mix.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
