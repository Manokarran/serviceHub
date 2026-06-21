'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { FONT_FAMILY_OPTIONS, SITE_THEME_PRESETS } from '../../constants/siteStylePresets'
import {
  BUTTON_PACK_PRESETS,
  FONT_PACK_PRESETS,
  FORM_PACK_PRESETS,
  findMatchingButtonPackId,
  findMatchingFontPackId,
  findMatchingFormPackId
} from '../../constants/stylePackPresets'
import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import { useBuilder } from '../../context/BuilderContext'
import { PropertyBodyText, PropertyFieldLabel, PropertySection } from '../property/PropertyPanelUi'
import type { SiteStylesView } from '../../types/siteStyles'
import type { ButtonShape, ButtonStyle, SiteAnimation, SpacingScale } from '../../types/siteStyles'
import { getButtonBorderRadius } from '../../utils/siteStylesHelpers'
import {
  ButtonPackPreview,
  ColorSwatchRow,
  FontPackPreview,
  FormPackPreview,
  PreviewButton,
  StyleCustomizeFooter,
  StyleNavRow,
  StylePackCard,
  StylePackGrid,
  StylePanelBody,
  StylePanelHeader,
  StyleSectionCard
} from './StyleSectionCard'
import { SitePageBackgroundPanel } from './SitePageBackgroundPanel'

type Props = {
  onClose?: () => void
}

export function SiteStylesPanel({ onClose }: Props) {
  const theme = useTheme()
  const { siteStyles, updateSiteStyles, applyThemePreset } = useBuilder()
  const [view, setView] = useState<SiteStylesView>('home')

  const swatches = [
    siteStyles.colors.swatch1,
    siteStyles.colors.swatch2,
    siteStyles.colors.swatch3,
    siteStyles.colors.swatch4,
    siteStyles.colors.swatch5
  ]

  if (view === 'home') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Site Styles' onClose={onClose} />
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <StyleSectionCard label='Themes' onClick={() => setView('themes')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 500, fontFamily: siteStyles.fonts.headingFamily, lineHeight: 1 }}>
                Aa
              </Typography>
              <ColorSwatchRow colors={swatches} />
              <PreviewButton label='BUTTON' colors={{ bg: siteStyles.colors.accent, text: '#fff' }} />
            </Box>
          </StyleSectionCard>

          <StyleSectionCard label='Fonts' onClick={() => setView('fonts')}>
            <Typography
              sx={{
                fontFamily: siteStyles.fonts.headingFamily,
                fontWeight: siteStyles.fonts.headingWeight,
                fontSize: '1.125rem',
                lineHeight: 1.2,
                mb: 0.5
              }}
            >
              Heading
            </Typography>
            <Typography sx={{ fontFamily: siteStyles.fonts.bodyFamily, fontSize: '0.8125rem', color: 'text.secondary' }}>
              This is your paragraph.
            </Typography>
          </StyleSectionCard>

          <StyleSectionCard label='Colors' onClick={() => setView('colors')}>
            <ColorSwatchRow colors={swatches} />
          </StyleSectionCard>

          <StyleSectionCard label='Buttons' onClick={() => setView('buttons')}>
            <PreviewButton label='BUTTON' colors={{ bg: siteStyles.colors.accent, text: '#fff' }} />
          </StyleSectionCard>

          <StyleSectionCard label='Forms' onClick={() => setView('forms')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  border: `${siteStyles.forms.fieldBorderWidth}px solid ${siteStyles.forms.fieldBorderColor}`,
                  borderRadius: getButtonBorderRadius(siteStyles.forms.fieldShape),
                  backgroundColor: siteStyles.forms.fieldBackground,
                  fontSize: '0.8125rem',
                  color: 'text.secondary',
                  minWidth: 80,
                  textAlign: 'center'
                }}
              >
                Text
              </Box>
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: 0.5,
                  backgroundColor: siteStyles.colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.65rem'
                }}
              >
                <i className='ri-check-line' />
              </Box>
            </Box>
          </StyleSectionCard>

          <Box sx={{ pt: 0.5 }}>
            <StyleNavRow label='Miscellaneous' onClick={() => setView('misc')} />
          </Box>
        </Box>
      </Box>
    )
  }

  if (view === 'themes') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Themes' onBack={() => setView('home')} onClose={onClose} />
        <StylePanelBody>
          <PropertyBodyText>Apply a preset that updates fonts, colors, and buttons together — like Squarespace theme packs.</PropertyBodyText>
          {SITE_THEME_PRESETS.map(preset => (
            <Box
              key={preset.id}
              onClick={() => applyThemePreset(preset.id)}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '2px solid',
                borderColor: siteStyles.themeId === preset.id ? 'primary.main' : alpha(theme.palette.divider, 0.9),
                cursor: 'pointer',
                backgroundColor: siteStyles.themeId === preset.id ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, m: 0 }}>
                  {preset.name}
                </Typography>
                {preset.id === 'plain' && (
                  <Typography
                    component='span'
                    sx={{
                      ...BUILDER_TYPOGRAPHY.label,
                      fontSize: '0.625rem',
                      px: 0.625,
                      py: 0.125,
                      borderRadius: 0.5,
                      color: 'text.secondary',
                      backgroundColor: alpha(theme.palette.text.primary, 0.06)
                    }}
                  >
                    Default
                  </Typography>
                )}
              </Box>
              <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', fontWeight: 400, display: 'block', mb: 1, m: 0 }}>
                {preset.description}
              </Typography>
              <ColorSwatchRow
                colors={[
                  preset.styles.colors.swatch1,
                  preset.styles.colors.swatch2,
                  preset.styles.colors.swatch3,
                  preset.styles.colors.swatch4,
                  preset.styles.colors.swatch5
                ]}
              />
            </Box>
          ))}
        </StylePanelBody>
      </Box>
    )
  }

  if (view === 'fonts') {
    const selectedPackId = findMatchingFontPackId(siteStyles.fonts)

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Recommended Font Packs' onBack={() => setView('home')} onClose={onClose} />
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <StylePackGrid>
            {FONT_PACK_PRESETS.map(pack => (
              <StylePackCard
                key={pack.id}
                selected={selectedPackId === pack.id}
                onClick={() => updateSiteStyles({ fonts: pack.fonts })}
              >
                <FontPackPreview fonts={pack.fonts} />
              </StylePackCard>
            ))}
          </StylePackGrid>
        </Box>
        <StyleCustomizeFooter onClick={() => setView('fonts-customize')} />
      </Box>
    )
  }

  if (view === 'fonts-customize') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Fonts' onBack={() => setView('fonts')} onClose={onClose} />
        <StylePanelBody>
          <PropertySection title='Global text styles'>
          <FormControl size='small' fullWidth>
            <InputLabel>Heading font</InputLabel>
            <Select
              label='Heading font'
              value={siteStyles.fonts.headingFamily}
              onChange={e => updateSiteStyles({ fonts: { ...siteStyles.fonts, headingFamily: e.target.value } })}
            >
              {FONT_FAMILY_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size='small' fullWidth>
            <InputLabel>Paragraph font</InputLabel>
            <Select
              label='Paragraph font'
              value={siteStyles.fonts.bodyFamily}
              onChange={e => updateSiteStyles({ fonts: { ...siteStyles.fonts, bodyFamily: e.target.value } })}
            >
              {FONT_FAMILY_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box>
            <PropertyFieldLabel>Heading weight: {siteStyles.fonts.headingWeight}</PropertyFieldLabel>
            <Slider
              value={siteStyles.fonts.headingWeight}
              min={400}
              max={900}
              step={100}
              onChange={(_, v) => updateSiteStyles({ fonts: { ...siteStyles.fonts, headingWeight: v as number } })}
            />
          </Box>
          <Box>
            <PropertyFieldLabel>Body size: {siteStyles.fonts.bodySize}px</PropertyFieldLabel>
            <Slider
              value={siteStyles.fonts.bodySize}
              min={12}
              max={20}
              step={1}
              onChange={(_, v) => updateSiteStyles({ fonts: { ...siteStyles.fonts, bodySize: v as number } })}
            />
          </Box>
          <Box>
            <PropertyFieldLabel>Heading scale: {siteStyles.fonts.headingScale.toFixed(2)}×</PropertyFieldLabel>
            <Slider
              value={siteStyles.fonts.headingScale}
              min={0.8}
              max={1.3}
              step={0.05}
              onChange={(_, v) => updateSiteStyles({ fonts: { ...siteStyles.fonts, headingScale: v as number } })}
            />
          </Box>
          </PropertySection>
        </StylePanelBody>
      </Box>
    )
  }

  if (view === 'colors') {
    const colorFields = [
      { key: 'swatch1' as const, label: 'Lightest' },
      { key: 'swatch2' as const, label: 'Light' },
      { key: 'swatch3' as const, label: 'Mid' },
      { key: 'swatch4' as const, label: 'Dark' },
      { key: 'swatch5' as const, label: 'Darkest' },
      { key: 'accent' as const, label: 'Accent' },
      { key: 'background' as const, label: 'Page background' },
      { key: 'text' as const, label: 'Text' }
    ]

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Colors' onBack={() => setView('home')} onClose={onClose} />
        <StylePanelBody>
          <PropertyBodyText>Edit your palette — Squarespace generates section themes from these base colors.</PropertyBodyText>
          <ColorSwatchRow colors={swatches} />
          {colorFields.map(field => (
            <Box key={field.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TextField
                label={field.label}
                size='small'
                fullWidth
                value={siteStyles.colors[field.key]}
                onChange={e =>
                  updateSiteStyles({ colors: { ...siteStyles.colors, [field.key]: e.target.value } })
                }
              />
              <Box
                component='input'
                type='color'
                value={siteStyles.colors[field.key]}
                onChange={e =>
                  updateSiteStyles({ colors: { ...siteStyles.colors, [field.key]: e.target.value } })
                }
                sx={{ width: 36, height: 36, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0, cursor: 'pointer' }}
              />
            </Box>
          ))}
        </StylePanelBody>
      </Box>
    )
  }

  if (view === 'buttons') {
    const selectedPackId = findMatchingButtonPackId(siteStyles.buttons)

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Recommended Button Styles' onBack={() => setView('home')} onClose={onClose} />
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <StylePackGrid>
            {BUTTON_PACK_PRESETS.map(pack => (
              <StylePackCard
                key={pack.id}
                selected={selectedPackId === pack.id}
                onClick={() => updateSiteStyles({ buttons: pack.buttons })}
              >
                <ButtonPackPreview buttons={pack.buttons} accent={siteStyles.colors.accent} />
              </StylePackCard>
            ))}
          </StylePackGrid>
        </Box>
        <StyleCustomizeFooter onClick={() => setView('buttons-customize')} />
      </Box>
    )
  }

  if (view === 'buttons-customize') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Buttons' onBack={() => setView('buttons')} onClose={onClose} />
        <StylePanelBody>
          {(['primary', 'secondary', 'tertiary'] as const).map(role => (
            <PropertySection key={role} title={`${role.charAt(0).toUpperCase() + role.slice(1)} button`}>
              <FormControl size='small' fullWidth>
                <InputLabel>Shape</InputLabel>
                <Select
                  label='Shape'
                  value={siteStyles.buttons[role].shape}
                  onChange={e =>
                    updateSiteStyles({
                      buttons: {
                        ...siteStyles.buttons,
                        [role]: { ...siteStyles.buttons[role], shape: e.target.value as ButtonShape }
                      }
                    })
                  }
                >
                  <MenuItem value='square'>Square</MenuItem>
                  <MenuItem value='rounded'>Rounded</MenuItem>
                  <MenuItem value='pill'>Pill</MenuItem>
                </Select>
              </FormControl>
              <FormControl size='small' fullWidth>
                <InputLabel>Style</InputLabel>
                <Select
                  label='Style'
                  value={siteStyles.buttons[role].style}
                  onChange={e =>
                    updateSiteStyles({
                      buttons: {
                        ...siteStyles.buttons,
                        [role]: { ...siteStyles.buttons[role], style: e.target.value as ButtonStyle }
                      }
                    })
                  }
                >
                  <MenuItem value='solid'>Solid</MenuItem>
                  <MenuItem value='outline'>Outline</MenuItem>
                  <MenuItem value='ghost'>Text only</MenuItem>
                </Select>
              </FormControl>
            </PropertySection>
          ))}
        </StylePanelBody>
      </Box>
    )
  }

  if (view === 'forms') {
    const selectedPackId = findMatchingFormPackId(siteStyles.forms)

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Recommended Form Styles' onBack={() => setView('home')} onClose={onClose} />
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <StylePackGrid>
            {FORM_PACK_PRESETS.map(pack => (
              <StylePackCard
                key={pack.id}
                selected={selectedPackId === pack.id}
                onClick={() => updateSiteStyles({ forms: pack.forms })}
              >
                <FormPackPreview forms={pack.forms} accent={siteStyles.colors.accent} />
              </StylePackCard>
            ))}
          </StylePackGrid>
        </Box>
        <StyleCustomizeFooter onClick={() => setView('forms-customize')} />
      </Box>
    )
  }

  if (view === 'forms-customize') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Forms' onBack={() => setView('forms')} onClose={onClose} />
        <StylePanelBody>
          <FormControl size='small' fullWidth>
            <InputLabel>Field shape</InputLabel>
            <Select
              label='Field shape'
              value={siteStyles.forms.fieldShape}
              onChange={e =>
                updateSiteStyles({ forms: { ...siteStyles.forms, fieldShape: e.target.value as ButtonShape } })
              }
            >
              <MenuItem value='square'>Square</MenuItem>
              <MenuItem value='rounded'>Rounded</MenuItem>
              <MenuItem value='pill'>Pill</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <PropertyFieldLabel>Border width: {siteStyles.forms.fieldBorderWidth}px</PropertyFieldLabel>
            <Slider
              value={siteStyles.forms.fieldBorderWidth}
              min={0}
              max={3}
              step={1}
              onChange={(_, v) =>
                updateSiteStyles({ forms: { ...siteStyles.forms, fieldBorderWidth: v as number } })
              }
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              label='Border color'
              size='small'
              fullWidth
              value={siteStyles.forms.fieldBorderColor}
              onChange={e => updateSiteStyles({ forms: { ...siteStyles.forms, fieldBorderColor: e.target.value } })}
            />
            <Box
              component='input'
              type='color'
              value={siteStyles.forms.fieldBorderColor}
              onChange={e => updateSiteStyles({ forms: { ...siteStyles.forms, fieldBorderColor: e.target.value } })}
              sx={{ width: 36, height: 36, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0 }}
            />
          </Box>
        </StylePanelBody>
      </Box>
    )
  }

  if (view === 'misc') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Miscellaneous' onBack={() => setView('home')} onClose={onClose} />
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
          <StyleNavRow label='Animations' onClick={() => setView('misc-animations')} />
          <StyleNavRow label='Background animation' onClick={() => setView('misc-page-background')} />
          <StyleNavRow label='Spacing' onClick={() => setView('misc-spacing')} />
          <StyleNavRow label='Page canvas' onClick={() => setView('misc-canvas')} />
          <StyleNavRow label='Image Blocks' onClick={() => setView('misc-image-blocks')} />
        </Box>
      </Box>
    )
  }

  if (view === 'misc-animations') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Animations' onBack={() => setView('misc')} onClose={onClose} />
        <StylePanelBody>
          <PropertyBodyText>Site-wide default animation when blocks enter the viewport.</PropertyBodyText>
          <FormControl size='small' fullWidth>
            <InputLabel>Animation</InputLabel>
            <Select
              label='Animation'
              value={siteStyles.misc.animation}
              onChange={e =>
                updateSiteStyles({ misc: { ...siteStyles.misc, animation: e.target.value as SiteAnimation } })
              }
            >
              <MenuItem value='none'>None</MenuItem>
              <MenuItem value='fade'>Fade in</MenuItem>
              <MenuItem value='slide-up'>Slide up</MenuItem>
              <MenuItem value='scale'>Scale in</MenuItem>
            </Select>
          </FormControl>
        </StylePanelBody>
      </Box>
    )
  }

  if (view === 'misc-page-background') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Background animation' onBack={() => setView('misc')} onClose={onClose} />
        <StylePanelBody>
          <SitePageBackgroundPanel />
        </StylePanelBody>
      </Box>
    )
  }

  if (view === 'misc-spacing') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Spacing' onBack={() => setView('misc')} onClose={onClose} />
        <StylePanelBody>
          <PropertyBodyText>Adjust default vertical spacing between sections across your site.</PropertyBodyText>
          <FormControl size='small' fullWidth>
            <InputLabel>Spacing scale</InputLabel>
            <Select
              label='Spacing scale'
              value={siteStyles.misc.spacingScale}
              onChange={e =>
                updateSiteStyles({ misc: { ...siteStyles.misc, spacingScale: e.target.value as SpacingScale } })
              }
            >
              <MenuItem value='compact'>Compact</MenuItem>
              <MenuItem value='default'>Default</MenuItem>
              <MenuItem value='spacious'>Spacious</MenuItem>
            </Select>
          </FormControl>
        </StylePanelBody>
      </Box>
    )
  }

  if (view === 'misc-canvas') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Page canvas' onBack={() => setView('misc')} onClose={onClose} />
        <StylePanelBody>
          <PropertyBodyText>
            Corner radius of the page preview frame in the builder. Set to 0 for sharp square corners.
          </PropertyBodyText>
          <Box>
            <PropertyFieldLabel>
              Corner radius: {siteStyles.misc.canvasCornerRadius ?? 0}px
            </PropertyFieldLabel>
            <Slider
              value={siteStyles.misc.canvasCornerRadius ?? 0}
              min={0}
              max={32}
              step={2}
              onChange={(_, v) =>
                updateSiteStyles({ misc: { ...siteStyles.misc, canvasCornerRadius: v as number } })
              }
            />
          </Box>
        </StylePanelBody>
      </Box>
    )
  }

  if (view === 'misc-image-blocks') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <StylePanelHeader title='Image Blocks' onBack={() => setView('misc')} onClose={onClose} />
        <StylePanelBody>
          <Box>
            <PropertyFieldLabel>Corner radius: {siteStyles.misc.imageCornerRadius}px</PropertyFieldLabel>
            <Slider
              value={siteStyles.misc.imageCornerRadius}
              min={0}
              max={24}
              step={2}
              onChange={(_, v) =>
                updateSiteStyles({ misc: { ...siteStyles.misc, imageCornerRadius: v as number } })
              }
            />
          </Box>
          <FormControl size='small' fullWidth>
            <InputLabel>Default aspect ratio</InputLabel>
            <Select
              label='Default aspect ratio'
              value={siteStyles.misc.imageAspectRatio}
              onChange={e =>
                updateSiteStyles({
                  misc: { ...siteStyles.misc, imageAspectRatio: e.target.value as typeof siteStyles.misc.imageAspectRatio }
                })
              }
            >
              <MenuItem value='auto'>Auto</MenuItem>
              <MenuItem value='16/9'>16:9</MenuItem>
              <MenuItem value='4/3'>4:3</MenuItem>
              <MenuItem value='1/1'>Square</MenuItem>
            </Select>
          </FormControl>
          <FormControl size='small' fullWidth>
            <InputLabel>Hover effect</InputLabel>
            <Select
              label='Hover effect'
              value={siteStyles.misc.imageHoverEffect}
              onChange={e =>
                updateSiteStyles({
                  misc: { ...siteStyles.misc, imageHoverEffect: e.target.value as typeof siteStyles.misc.imageHoverEffect }
                })
              }
            >
              <MenuItem value='none'>None</MenuItem>
              <MenuItem value='zoom'>Zoom</MenuItem>
              <MenuItem value='fade'>Fade</MenuItem>
            </Select>
          </FormControl>
        </StylePanelBody>
      </Box>
    )
  }

  return null
}
