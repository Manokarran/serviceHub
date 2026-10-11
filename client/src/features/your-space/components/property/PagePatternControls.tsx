'use client'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY, builderSegmentedControlSx } from '../../constants/builderLayout'
import {
  getPagePatternLabel,
  PAGE_PATTERN_OPTIONS,
  type PagePatternId,
  type PagePatternScope
} from '../../constants/pagePatterns'
import { useBuilder } from '../../context/BuilderContext'
import {
  countPagePatternOverrides,
  pagePatternScope,
  resolvePagePattern,
  writePagePattern
} from '../../utils/pagePatternHelpers'
import { PagePatternPreview } from '../PagePatternLayer'
import { CompactButton, PropertyBodyText, PropertyFieldLabel, PropertySection } from './PropertyPanelUi'
import { PropertySliderField } from './PropertySliderField'

const SCOPE_OPTIONS: { id: PagePatternScope; label: string }[] = [
  { id: 'page', label: 'This page' },
  { id: 'site', label: 'Entire website' }
]

export function PagePatternControls() {
  const theme = useTheme()
  const { siteStyles, updateSiteStyles, currentPageSlug, currentPageTitle } = useBuilder()
  const scope = pagePatternScope(siteStyles, currentPageSlug)
  const config = resolvePagePattern(siteStyles, currentPageSlug)
  const pageOverrideCount = countPagePatternOverrides(siteStyles.misc)
  const otherPagesHavePattern = scope === 'site' && pageOverrideCount > 0

  const commit = (nextScope: PagePatternScope, pattern: PagePatternId, loadStrength: number, hoverStrength: number, replaceEveryPage = false) => {
    updateSiteStyles({
      misc: writePagePattern(
        siteStyles.misc,
        currentPageSlug,
        nextScope,
        { pattern, loadStrength, hoverStrength },
        { replaceEveryPage }
      )
    })
  }

  return (
    <PropertySection title='Background pattern'>
      <PropertyBodyText>
        A faint line pattern sits on {currentPageTitle || 'this page'}. Moving the pointer brightens the same lines,
        like a light passing over them. Preview shows that light across the page. While editing, the block under the
        pointer stays clear so its toolbar remains easy to use.
      </PropertyBodyText>

      <Box>
        <PropertyFieldLabel>Pattern</PropertyFieldLabel>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 0.75
          }}
        >
          {PAGE_PATTERN_OPTIONS.map(option => {
            const selected = config.pattern === option.id

            return (
              <Tooltip key={option.id} title={option.label} placement='top'>
                <Box
                  component='button'
                  type='button'
                  aria-label={option.label}
                  aria-pressed={selected}
                  onClick={() => commit(scope, option.id, config.loadStrength, config.hoverStrength)}
                  sx={{
                    p: 0.4,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: '1px solid',
                    borderColor: selected ? 'primary.main' : alpha(theme.palette.divider, 0.9),
                    boxShadow: selected ? `0 0 0 1px ${theme.palette.primary.main}` : 'none',
                    '&:hover': {
                      borderColor: selected ? 'primary.main' : alpha(theme.palette.text.primary, 0.28)
                    }
                  }}
                >
                  {option.id === 'none' ? (
                    <Box
                      sx={{
                        height: 36,
                        borderRadius: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: siteStyles.colors.background,
                        color: 'text.disabled'
                      }}
                    >
                      <i className='ri-prohibited-line' style={{ fontSize: '0.95rem' }} />
                    </Box>
                  ) : (
                    <PagePatternPreview
                      pattern={option.id}
                      color={siteStyles.colors.text}
                      background={siteStyles.colors.background}
                      width='100%'
                      height={36}
                    />
                  )}
                </Box>
              </Tooltip>
            )
          })}
        </Box>
        <Typography
          component='p'
          sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', m: 0, mt: 0.75, textAlign: 'center' }}
        >
          {getPagePatternLabel(config.pattern)}
        </Typography>
      </Box>

      <Box>
        <PropertyFieldLabel>Apply to</PropertyFieldLabel>
        <Box sx={{ display: 'flex', width: '100%', ...builderSegmentedControlSx(theme) }}>
          {SCOPE_OPTIONS.map(option => {
            const selected = scope === option.id

            return (
              <Box
                key={option.id}
                component='button'
                type='button'
                aria-pressed={selected}
                onClick={() => {
                  if (selected) {
                    return
                  }

                  commit(option.id, config.pattern, config.loadStrength, config.hoverStrength)
                }}
                sx={{
                  flex: 1,
                  border: 'none',
                  cursor: 'pointer',
                  py: 0.5,
                  px: 0.75,
                  borderRadius: '5px',
                  ...BUILDER_TYPOGRAPHY.tab,
                  color: selected ? 'text.primary' : 'text.secondary',
                  backgroundColor: selected ? 'background.paper' : 'transparent',
                  boxShadow: selected
                    ? `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}, 0 0 0 1px ${alpha(theme.palette.common.black, 0.05)}`
                    : 'none'
                }}
              >
                {option.label}
              </Box>
            )
          })}
        </Box>
        <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', m: 0, mt: 0.75 }}>
          {scope === 'page'
            ? 'This page uses these settings.'
            : 'These settings are the pattern for the website.'}
        </Typography>
      </Box>

      <PropertySliderField
        label='On load'
        value={config.loadStrength}
        min={0}
        max={100}
        step={1}
        unit='%'
        onChange={value => commit(scope, config.pattern, value, config.hoverStrength)}
      />
      <PropertySliderField
        label='On hover'
        value={config.hoverStrength}
        min={0}
        max={100}
        step={1}
        unit='%'
        onChange={value => commit(scope, config.pattern, config.loadStrength, value)}
      />

      {otherPagesHavePattern ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <PropertyBodyText>Some pages keep a pattern of their own.</PropertyBodyText>
          <CompactButton
            onClick={() => commit('site', config.pattern, config.loadStrength, config.hoverStrength, true)}
          >
            Use this pattern on every page
          </CompactButton>
        </Box>
      ) : null}
    </PropertySection>
  )
}
