'use client'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { builderSoftCardSx } from '../../../constants/builderChrome'
import { useBuilder } from '../../../context/BuilderContext'
import type { Block, HeadingBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PropertyColorField } from '../PropertyColorField'
import { AlignmentControl } from '../AlignmentControl'
import { TextTypographyControls } from '../TextTypographyControls'
import { useSiteStyles } from '../../SiteStylesScope'

const LEVEL_OPTIONS: { value: 1 | 2 | 3; label: string; sublabel: string }[] = [
  { value: 1, label: 'H1', sublabel: 'Large' },
  { value: 2, label: 'H2', sublabel: 'Medium' },
  { value: 3, label: 'H3', sublabel: 'Small' }
]

function LevelControl({
  value,
  onChange
}: {
  value: 1 | 2 | 3
  onChange: (v: 1 | 2 | 3) => void
}) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.625 }}>
      <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
        Heading level
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>
        {LEVEL_OPTIONS.map(opt => {
          const active = value === opt.value

          return (
            <Tooltip key={opt.value} title={opt.sublabel} placement='top'>
              <Box
                component='button'
                type='button'
                aria-label={`${opt.label} — ${opt.sublabel}`}
                aria-pressed={active}
                onClick={() => onChange(opt.value)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.125,
                  py: 0.75,
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
                  sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'inherit', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1 }}
                >
                  {opt.label}
                </Typography>
                <Typography
                  component='span'
                  sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 400, color: 'inherit', opacity: 0.7, lineHeight: 1, fontSize: '0.6rem' }}
                >
                  {opt.sublabel}
                </Typography>
              </Box>
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}

type Props = {
  block: Block<'heading'>
  activeTab: PropertyPanelTab
}

export function HeadingBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as HeadingBlockProps
  const update = (changes: Partial<HeadingBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <PropertyTextField
          label='Text'
          value={props.text}
          onChange={text => update({ text })}
          placeholder='Heading text…'
        />
        <LevelControl value={props.level} onChange={level => update({ level })} />
      </PropertyFields>
    )
  }

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <AlignmentControl value={props.alignment} onChange={alignment => update({ alignment })} />
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <PropertyColorField
        label='Text color'
        value={props.color}
        onChange={color => update({ color })}
      />
      <TextTypographyControls
        role='heading'
        fonts={siteStyles.fonts}
        typography={props.typography}
        headingLevel={props.level}
        onChange={typography => update({ typography })}
      />
    </PropertyFields>
  )
}
