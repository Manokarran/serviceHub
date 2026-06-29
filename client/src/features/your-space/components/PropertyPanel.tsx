'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme, type SxProps, type Theme } from '@mui/material/styles'

import { PALETTE_ITEMS } from '../constants'
import { BUILDER_PROPERTY_PANEL_SX, FLOATING_PROPERTY_PANEL_WIDTH } from '../constants/builderLayout'
import { builderFormOutlineSx, builderSidePanelSx } from '../constants/builderChrome'
import { useBuilder } from '../context/BuilderContext'
import {
  PropertyBodyText,
  PropertyPanelHeader,
  PropertyPanelTabs,
  type PropertyPanelTab
} from './property/PropertyPanelUi'
import type { Block } from '../types'
import { getBlockLabel } from './blocks/BlockRenderer'
import { ButtonBlockProperties } from './property/blocks/ButtonBlockProperties'
import { HeadingBlockProperties } from './property/blocks/HeadingBlockProperties'
import { TextBlockProperties } from './property/blocks/TextBlockProperties'
import { ImageBlockProperties } from './property/blocks/ImageBlockProperties'
import { VideoBlockProperties } from './property/blocks/VideoBlockProperties'
import { LogoBlockProperties } from './property/blocks/LogoBlockProperties'
import { ShapeBlockProperties } from './property/blocks/ShapeBlockProperties'
import { IconBlockProperties } from './property/blocks/IconBlockProperties'
import { HeroBlockProperties } from './property/blocks/HeroBlockProperties'
import { SectionBlockProperties } from './property/blocks/SectionBlockProperties'
import { CarouselBlockProperties } from './property/blocks/CarouselBlockProperties'
import { TabsBlockProperties } from './property/blocks/TabsBlockProperties'
import { ContactFormBlockProperties } from './property/blocks/ContactFormBlockProperties'
import { HeaderBlockProperties } from './property/blocks/HeaderBlockProperties'
import { FooterBlockProperties } from './property/blocks/FooterBlockProperties'

function getBlockIcon(type: Block['type']): string {
  return PALETTE_ITEMS.find(item => item.type === type)?.icon ?? 'ri-layout-grid-line'
}

function getBlockTabs(type: Block['type']): PropertyPanelTab[] {
  if (type === 'section' || type === 'carousel' || type === 'tabs') {
    return ['layout', 'style']
  }

  return ['design', 'layout', 'style']
}

function BlockProperties({ block, activeTab }: { block: Block; activeTab: PropertyPanelTab }) {
  switch (block.type) {
    case 'header':
      return <HeaderBlockProperties block={block as Block<'header'>} activeTab={activeTab} />
    case 'footer':
      return <FooterBlockProperties block={block as Block<'footer'>} activeTab={activeTab} />
    case 'hero':
      return <HeroBlockProperties block={block as Block<'hero'>} activeTab={activeTab} />
    case 'section':
      return <SectionBlockProperties block={block as Block<'section'>} activeTab={activeTab} />
    case 'carousel':
      return <CarouselBlockProperties block={block as Block<'carousel'>} activeTab={activeTab} />
    case 'tabs':
      return <TabsBlockProperties block={block as Block<'tabs'>} activeTab={activeTab} />
    case 'heading':
      return <HeadingBlockProperties block={block as Block<'heading'>} activeTab={activeTab} />
    case 'text':
      return <TextBlockProperties block={block as Block<'text'>} activeTab={activeTab} />
    case 'button':
      return <ButtonBlockProperties block={block as Block<'button'>} activeTab={activeTab} />
    case 'image':
      return <ImageBlockProperties block={block as Block<'image'>} activeTab={activeTab} />
    case 'video':
      return <VideoBlockProperties block={block as Block<'video'>} activeTab={activeTab} />
    case 'logo':
      return <LogoBlockProperties block={block as Block<'logo'>} activeTab={activeTab} />
    case 'shape':
      return <ShapeBlockProperties block={block as Block<'shape'>} activeTab={activeTab} />
    case 'icon':
      return <IconBlockProperties block={block as Block<'icon'>} activeTab={activeTab} />
    case 'contactForm':
      return <ContactFormBlockProperties block={block as Block<'contactForm'>} activeTab={activeTab} />
    default:
      return null
  }
}


function EmptyState() {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, p: 2.5, textAlign: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
          color: 'text.secondary'
        }}
      >
        <i className='ri-cursor-line' style={{ fontSize: '1.1rem' }} />
      </Box>
      <PropertyBodyText>Select a block on the canvas to edit its properties.</PropertyBodyText>
    </Box>
  )
}

type PropertyContentProps = {
  onClose?: () => void
  focusTab?: PropertyPanelTab | null
  onFocusTabConsumed?: () => void
}

export function PropertyPanelContent({ onClose, focusTab, onFocusTabConsumed }: PropertyContentProps) {
  const theme = useTheme()
  const { selectedBlock, mode, deleteBlock } = useBuilder()
  const [activeTab, setActiveTab] = useState<PropertyPanelTab>('design')

  const availableTabs = useMemo(
    () => (selectedBlock ? getBlockTabs(selectedBlock.type) : []),
    [selectedBlock]
  )

  const tabItems = useMemo(
    () =>
      availableTabs.map(id => ({
        id,
        label: id === 'design' ? 'Design' : id === 'layout' ? 'Layout' : 'Style'
      })),
    [availableTabs]
  )

  useEffect(() => {
    if (availableTabs.length > 0) {
      setActiveTab(current => (availableTabs.includes(current) ? current : availableTabs[0]))
    }
  }, [selectedBlock?.id, availableTabs])

  useEffect(() => {
    if (!focusTab || !availableTabs.includes(focusTab)) {
      return
    }

    setActiveTab(focusTab)
    onFocusTabConsumed?.()
  }, [focusTab, availableTabs, onFocusTabConsumed])

  if (mode === 'preview') {
    return (
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <PropertyBodyText>Switch to Edit mode to customize blocks</PropertyBodyText>
      </Box>
    )
  }

  return (
    <>
      <PropertyPanelHeader
        title={selectedBlock ? getBlockLabel(selectedBlock.type) : 'Properties'}
        subtitle={selectedBlock ? 'Block settings' : 'Nothing selected'}
        icon={selectedBlock ? getBlockIcon(selectedBlock.type) : undefined}
        onClose={onClose}
        onDelete={selectedBlock ? () => deleteBlock(selectedBlock.id) : undefined}
      />
      {selectedBlock && tabItems.length > 0 && (
        <PropertyPanelTabs value={activeTab} onChange={setActiveTab} tabs={tabItems} />
      )}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          pb: 2.5,
          display: 'flex',
          flexDirection: 'column',
          ...BUILDER_PROPERTY_PANEL_SX,
          ...builderFormOutlineSx(theme)
        }}
      >
        {selectedBlock ? <BlockProperties block={selectedBlock} activeTab={activeTab} /> : <EmptyState />}
      </Box>
    </>
  )
}

type Props = {
  open: boolean
  onClose: () => void
  onOpen: () => void
  focusTab?: PropertyPanelTab | null
  onFocusTabConsumed?: () => void
}

export function PropertyPanel({ open, onClose, onOpen, focusTab, onFocusTabConsumed }: Props) {
  const theme = useTheme()
  const { mode } = useBuilder()

  const collapsedPanelSx: SxProps<Theme> = {
    width: 40,
    flexShrink: 0,
    display: { xs: 'none', lg: 'flex' },
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    pt: 1.5,
    height: '100%',
    ...builderSidePanelSx(theme, 'left')
  }

  const openPanelSx: SxProps<Theme> = {
    width: FLOATING_PROPERTY_PANEL_WIDTH,
    flexShrink: 0,
    display: { xs: 'none', lg: 'flex' },
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
    ...builderSidePanelSx(theme, 'left')
  }

  if (!open) {
    return (
      <Box sx={collapsedPanelSx}>
        <Tooltip title='Block properties' placement='left'>
          <IconButton
            size='small'
            onClick={onOpen}
            aria-label='Open block properties'
            sx={{ width: 32, height: 32, color: 'text.secondary' }}
          >
            <i className='ri-settings-3-line' style={{ fontSize: '1rem' }} />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Box sx={openPanelSx}>
      {mode === 'preview' ? (
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <PropertyBodyText>Switch to Edit mode to customize blocks</PropertyBodyText>
        </Box>
      ) : (
        <PropertyPanelContent
          onClose={onClose}
          focusTab={focusTab}
          onFocusTabConsumed={onFocusTabConsumed}
        />
      )}
    </Box>
  )
}
