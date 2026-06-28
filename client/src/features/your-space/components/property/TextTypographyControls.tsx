'use client'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { FONT_FAMILY_OPTIONS } from '../../constants/siteStylePresets'
import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import { builderSoftCardSx } from '../../constants/builderChrome'
import type { TextTypographyDecoration, TextTypographyOverrides, TextTypographyTransform } from '../../types'
import type { SiteFonts, SiteForms } from '../../types/siteStyles'
import {
  getThemeTypographyDefaults,
  getTypographyFontSelectValue,
  getTypographyFontSizeRange,
  getTypographyRoleLabel,
  hasTextTypographyOverrides,
  omitTypographyOverride,
  typographyFontSelectValueToOverride,
  type TextTypographyRole
} from '../../utils/textTypographyHelpers'
import { CompactButton, PropertyFieldLabel, PropertySection } from './PropertyPanelUi'
import { PropertySliderField } from './PropertySliderField'

type Props = {
  role: TextTypographyRole
  fonts: SiteFonts
  typography?: TextTypographyOverrides
  headingLevel?: 1 | 2 | 3
  forms?: SiteForms
  sectionTitle?: string
  onChange: (typography: TextTypographyOverrides | undefined) => void
}

type ToggleOption<T extends string> = {
  value: T
  label: string
}

function TypographyToggleGroup<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: T
  options: ToggleOption<T>[]
  onChange: (value: T) => void
}) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.625 }}>
      <PropertyFieldLabel>{label}</PropertyFieldLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 0.5 }}>
        {options.map(option => {
          const active = value === option.value

          return (
            <Box
              key={option.value}
              component='button'
              type='button'
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              sx={{
                py: 0.75,
                px: 0.5,
                border: 'none',
                borderRadius: 1,
                cursor: 'pointer',
                ...builderSoftCardSx(theme, active),
                color: active ? 'primary.main' : 'text.secondary',
                transition: 'all 0.12s'
              }}
            >
              <Typography
                component='span'
                sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'inherit', fontWeight: active ? 600 : 500, lineHeight: 1.2 }}
              >
                {option.label}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export function TextTypographyControls({
  role,
  fonts,
  typography,
  headingLevel,
  forms,
  sectionTitle = 'Typography',
  onChange
}: Props) {
  const typographyOptions = { headingLevel, forms }
  const themeDefaults = getThemeTypographyDefaults(role, fonts, typographyOptions)
  const fontSizeRange = getTypographyFontSizeRange(role)
  const effective = {
    fontSize: typography?.fontSize ?? themeDefaults.fontSize,
    fontWeight: typography?.fontWeight ?? themeDefaults.fontWeight,
    lineHeight: typography?.lineHeight ?? themeDefaults.lineHeight,
    letterSpacing: typography?.letterSpacing ?? themeDefaults.letterSpacing,
    fontStyle: typography?.fontStyle ?? themeDefaults.fontStyle,
    textTransform: typography?.textTransform ?? themeDefaults.textTransform,
    textDecoration: typography?.textDecoration ?? themeDefaults.textDecoration
  }

  const updateTypography = (changes: Partial<TextTypographyOverrides>) => {
    const next = { ...typography, ...changes }

    onChange(hasTextTypographyOverrides(next) ? next : undefined)
  }

  const setToggleOverride = <K extends 'fontStyle' | 'textTransform' | 'textDecoration'>(
    key: K,
    value: TextTypographyOverrides[K],
    themeValue: TextTypographyOverrides[K]
  ) => {
    if (value === themeValue) {
      onChange(omitTypographyOverride(typography, key))
      return
    }

    updateTypography({ [key]: value })
  }

  const clearOverride = (key: keyof TextTypographyOverrides) => {
    onChange(omitTypographyOverride(typography, key))
  }

  const fontSelectValue = getTypographyFontSelectValue(role, typography)
  const themeFontLabel = getTypographyRoleLabel(role)

  return (
    <PropertySection title={sectionTitle}>
      <FormControl size='small' fullWidth>
        <InputLabel>Font family</InputLabel>
        <Select
          label='Font family'
          value={fontSelectValue}
          onChange={e => {
            const override = typographyFontSelectValueToOverride(e.target.value)

            if (!override) {
              onChange(omitTypographyOverride(typography, 'fontSource'))
              return
            }

            updateTypography(override)
          }}
        >
          <MenuItem value='__theme__'>{themeFontLabel}</MenuItem>
          <MenuItem value='__heading__'>Site heading font</MenuItem>
          <MenuItem value='__body__'>Site paragraph font</MenuItem>
          {FONT_FAMILY_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value} sx={{ fontFamily: option.value }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <PropertySliderField
        label='Font size'
        value={effective.fontSize}
        min={fontSizeRange.min}
        max={fontSizeRange.max}
        step={1}
        onChange={fontSize => {
          if (fontSize === themeDefaults.fontSize) {
            clearOverride('fontSize')
            return
          }

          updateTypography({ fontSize })
        }}
        siteDefault={themeDefaults.fontSize}
        onUseSiteDefault={() => clearOverride('fontSize')}
      />

      <PropertySliderField
        label='Font weight'
        value={effective.fontWeight}
        min={100}
        max={900}
        step={100}
        unit=''
        onChange={fontWeight => {
          if (fontWeight === themeDefaults.fontWeight) {
            clearOverride('fontWeight')
            return
          }

          updateTypography({ fontWeight })
        }}
        siteDefault={themeDefaults.fontWeight}
        onUseSiteDefault={() => clearOverride('fontWeight')}
      />

      <TypographyToggleGroup
        label='Font style'
        value={effective.fontStyle}
        options={[
          { value: 'normal', label: 'Normal' },
          { value: 'italic', label: 'Italic' }
        ]}
        onChange={fontStyle => setToggleOverride('fontStyle', fontStyle, themeDefaults.fontStyle)}
      />

      <PropertySliderField
        label='Line height'
        value={Number(effective.lineHeight.toFixed(2))}
        min={0.8}
        max={3}
        step={0.05}
        unit='×'
        onChange={lineHeight => {
          if (lineHeight === themeDefaults.lineHeight) {
            clearOverride('lineHeight')
            return
          }

          updateTypography({ lineHeight })
        }}
        siteDefault={themeDefaults.lineHeight}
        onUseSiteDefault={() => clearOverride('lineHeight')}
      />

      <PropertySliderField
        label='Letter spacing'
        value={Number(effective.letterSpacing.toFixed(2))}
        min={-0.1}
        max={0.3}
        step={0.01}
        unit='em'
        onChange={letterSpacing => {
          if (letterSpacing === themeDefaults.letterSpacing) {
            clearOverride('letterSpacing')
            return
          }

          updateTypography({ letterSpacing })
        }}
        siteDefault={themeDefaults.letterSpacing}
        onUseSiteDefault={() => clearOverride('letterSpacing')}
      />

      <TypographyToggleGroup
        label='Text transform'
        value={effective.textTransform}
        options={[
          { value: 'none', label: 'None' },
          { value: 'uppercase', label: 'Upper' },
          { value: 'lowercase', label: 'Lower' },
          { value: 'capitalize', label: 'Title' }
        ]}
        onChange={(textTransform: TextTypographyTransform) =>
          setToggleOverride('textTransform', textTransform, themeDefaults.textTransform)
        }
      />

      <TypographyToggleGroup
        label='Text decoration'
        value={effective.textDecoration}
        options={[
          { value: 'none', label: 'None' },
          { value: 'underline', label: 'Underline' },
          { value: 'line-through', label: 'Strike' }
        ]}
        onChange={(textDecoration: TextTypographyDecoration) =>
          setToggleOverride('textDecoration', textDecoration, themeDefaults.textDecoration)
        }
      />

      {hasTextTypographyOverrides(typography) && (
        <CompactButton onClick={() => onChange(undefined)} variant='text' startIcon={<i className='ri-refresh-line' />}>
          Reset to theme style
        </CompactButton>
      )}
    </PropertySection>
  )
}
