'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, CarouselBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection } from '../PropertyPanelUi'
import { MaxWidthControl } from '../MaxWidthControl'
import { CarouselLayoutControls } from '../../CarouselLayoutControls'

type Props = {
  block: Block<'carousel'>
  activeTab: PropertyPanelTab
}

export function CarouselBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as CarouselBlockProps
  const update = (changes: Partial<CarouselBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <CarouselLayoutControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
      </PropertyFields>
    )
  }

  // Style tab
  return (
    <PropertyFields>
      <PropertySection title='Width' collapsible defaultOpen>
        <MaxWidthControl
          value={props.maxWidth}
          onChange={maxWidth => update({ maxWidth })}
        />
      </PropertySection>
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
        <i className='ri-layout-grid-line' style={{ fontSize: '0.875rem', marginTop: 1, flexShrink: 0 }} />
        <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 400, color: 'text.secondary', m: 0 }}>
          Use the slide tabs on the canvas to add content to each slide, or manage slides from the carousel toolbar.
        </Typography>
      </Box>
    </PropertyFields>
  )
}
