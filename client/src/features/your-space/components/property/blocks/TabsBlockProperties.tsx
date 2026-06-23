'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, TabsBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection } from '../PropertyPanelUi'
import { MaxWidthControl } from '../MaxWidthControl'
import { TabsLayoutControls } from '../../TabsLayoutControls'

type Props = {
  block: Block<'tabs'>
  activeTab: PropertyPanelTab
}

export function TabsBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as TabsBlockProps
  const update = (changes: Partial<TabsBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <TabsLayoutControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
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
        <i className='ri-layout-row-line' style={{ fontSize: '0.875rem', marginTop: 1, flexShrink: 0 }} />
        <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 400, color: 'text.secondary', m: 0 }}>
          Click tab labels on the canvas to switch panels and drop blocks into each tab. Manage tabs from the layout panel.
        </Typography>
      </Box>
    </PropertyFields>
  )
}
