'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { useBuilder } from '../../../context/BuilderContext'
import type { Block, LogoBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PageLinkField } from '../PageLinkField'
import { PropertySliderField } from '../PropertySliderField'
import { AlignmentControl } from '../AlignmentControl'
import { MediaSourceField } from '../MediaSourceField'

type Props = {
  block: Block<'logo'>
  activeTab: PropertyPanelTab
}

export function LogoBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const props = block.props as LogoBlockProps
  const update = (changes: Partial<LogoBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <MediaSourceField
          label='Logo image'
          value={props.src}
          onChange={src => update({ src })}
          clearLabel='Remove logo'
        />
        <PropertyTextField
          label='Alt text'
          value={props.alt}
          onChange={alt => update({ alt })}
          placeholder='Company name or logo description'
          helperText='Used by screen readers and search engines'
        />
        <PageLinkField
          label='Link URL'
          value={props.link}
          onChange={link => update({ link })}
          placeholder='/ or https://…'
        />
      </PropertyFields>
    )
  }

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <AlignmentControl value={props.alignment} onChange={alignment => update({ alignment })} />
        <PropertySliderField
          label='Max height'
          value={props.maxHeight}
          min={24}
          max={120}
          step={4}
          unit='px'
          onChange={maxHeight => update({ maxHeight })}
        />
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.875,
          px: 1.25,
          py: 1,
          borderRadius: 1,
          backgroundColor: theme => alpha(theme.palette.text.primary, 0.03),
          border: '1px solid',
          borderColor: theme => alpha(theme.palette.divider, 0.6)
        }}
      >
        <i className='ri-information-line' style={{ fontSize: '0.875rem', marginTop: 1, flexShrink: 0 }} />
        <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 400, color: 'text.secondary', m: 0 }}>
          Logo width scales automatically to preserve aspect ratio. Use max height in Layout to control size.
        </Typography>
      </Box>
    </PropertyFields>
  )
}
