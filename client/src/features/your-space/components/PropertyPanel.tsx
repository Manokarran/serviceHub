'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { PALETTE_ITEMS } from '../constants'
import { BUILDER_PROPERTY_PANEL_SX } from '../constants/builderLayout'
import { OverlayPanelSync } from '../context/BuilderOverlayContext'
import { builderFormOutlineSx, builderSidePanelSx } from '../constants/builderChrome'
import { useBuilder } from '../context/BuilderContext'
import { useFloatingPanelRect } from '../hooks/useFloatingPanelRect'
import { BUILDER_PROPERTY_FRAME_KEY, isDockedMaximized, isMaximizedRect } from '../utils/builderPanelFrame'
import { BuilderFloatingFrame, DockToolButton } from './BuilderFloatingFrame'
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
import { ShowcaseBlockProperties } from './property/blocks/ShowcaseBlockProperties'
import { PricingBlockProperties } from './property/blocks/PricingBlockProperties'
import { FaqBlockProperties } from './property/blocks/FaqBlockProperties'
import { ServiceDirectoryBlockProperties } from './property/blocks/ServiceDirectoryBlockProperties'
import { ServiceBookingBlockProperties } from './property/blocks/ServiceBookingBlockProperties'
import { CustomerBookingsBlockProperties } from './property/blocks/CustomerBookingsBlockProperties'
import { LocationBlockProperties } from './property/blocks/LocationBlockProperties'

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
    case 'showcase':
      return <ShowcaseBlockProperties block={block as Block<'showcase'>} activeTab={activeTab} />
    case 'pricing':
      return <PricingBlockProperties block={block as Block<'pricing'>} activeTab={activeTab} />
    case 'faq':
      return <FaqBlockProperties block={block as Block<'faq'>} activeTab={activeTab} />
    case 'serviceDirectory':
      return <ServiceDirectoryBlockProperties block={block as Block<'serviceDirectory'>} activeTab={activeTab} />
    case 'serviceBooking':
      return <ServiceBookingBlockProperties block={block as Block<'serviceBooking'>} activeTab={activeTab} />
    case 'customerBookings':
      return <CustomerBookingsBlockProperties block={block as Block<'customerBookings'>} activeTab={activeTab} />
    case 'location':
      return <LocationBlockProperties block={block as Block<'location'>} activeTab={activeTab} />
    default:
      return null
  }
}

function EmptyState() {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        p: 2.5,
        textAlign: 'center',
        gap: 1.25
      }}
    >
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
  draggable?: boolean
  maximized?: boolean
  onMaximize?: () => void
  overlay?: boolean
  pinned?: boolean
  onPinToggle?: () => void
}

export function PropertyPanelContent({
  onClose,
  focusTab,
  onFocusTabConsumed,
  draggable = false,
  maximized = false,
  onMaximize,
  overlay = false,
  pinned = false,
  onPinToggle
}: PropertyContentProps) {
  const theme = useTheme()
  const { selectedBlock, mode, deleteBlock } = useBuilder()
  const [activeTab, setActiveTab] = useState<PropertyPanelTab>('design')

  const availableTabs = useMemo(() => (selectedBlock ? getBlockTabs(selectedBlock.type) : []), [selectedBlock])

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
        draggable={draggable}
        extraActions={
          <>
            {onMaximize && (
              <DockToolButton
                title={maximized ? 'Restore panel size' : overlay ? 'Fill window' : 'Widen panel'}
                icon={maximized ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'}
                onClick={onMaximize}
                active={maximized}
                ariaLabel={maximized ? 'Restore panel size' : overlay ? 'Fill window' : 'Widen panel'}
              />
            )}
            {onPinToggle && (
              <DockToolButton
                title={pinned ? 'Float outside layout' : 'Pin to the side'}
                icon={pinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'}
                onClick={onPinToggle}
                active={pinned}
                ariaLabel={pinned ? 'Unpin panel' : 'Pin panel'}
              />
            )}
          </>
        }
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
  overlay?: boolean
  highlighted?: boolean
  focusTab?: PropertyPanelTab | null
  onFocusTabConsumed?: () => void
  pinned?: boolean
  onPinToggle?: () => void
}

function PropertyPanelRail({
  highlighted,
  onClose,
  onOpen
}: {
  highlighted: boolean
  onClose: () => void
  onOpen: () => void
}) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        width: 44,
        flexShrink: 0,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        pt: 1.25,
        gap: 0.5,
        height: '100%',
        ...builderSidePanelSx(theme, 'left')
      }}
    >
      <Tooltip title={highlighted ? 'Hide block properties' : 'Block properties'} placement='left'>
        <IconButton
          size='small'
          onClick={highlighted ? onClose : onOpen}
          aria-label={highlighted ? 'Hide block properties' : 'Open block properties'}
          aria-pressed={highlighted}
          sx={{
            width: 32,
            height: 32,
            color: highlighted ? 'primary.main' : 'text.secondary',
            backgroundColor: highlighted ? alpha(theme.palette.primary.main, 0.12) : 'transparent'
          }}
        >
          <i className='ri-settings-3-line' style={{ fontSize: '1rem' }} />
        </IconButton>
      </Tooltip>
      <Typography
        component='span'
        sx={{
          fontSize: '0.5625rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: highlighted ? 'primary.main' : 'text.disabled',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          mt: 0.5
        }}
      >
        Props
      </Typography>
    </Box>
  )
}

function PropertyPanelFrame({
  overlay,
  onClose,
  focusTab,
  onFocusTabConsumed,
  pinned,
  onPinToggle
}: {
  overlay: boolean
  onClose: () => void
  focusTab?: PropertyPanelTab | null
  onFocusTabConsumed?: () => void
  pinned: boolean
  onPinToggle: () => void
}) {
  const { mode } = useBuilder()
  const { rect, parentSize, commit, layoutCommit, restoreUser, ensureLayout, maximize } = useFloatingPanelRect(
    BUILDER_PROPERTY_FRAME_KEY,
    'right'
  )

  const handleCommit = useCallback(
    (next: Parameters<typeof commit>[0], parent: Parameters<typeof commit>[1]) => {
      commit(next, parent, overlay ? 'overlay' : 'docked')
    },
    [commit, overlay]
  )

  const handleEnsureLayout = useCallback(
    (parent: Parameters<typeof ensureLayout>[0]) => {
      ensureLayout(parent, overlay ? 'overlay' : 'docked')
    },
    [ensureLayout, overlay]
  )

  const content =
    mode === 'preview' ? (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <PropertyBodyText>Switch to Edit mode to customize blocks</PropertyBodyText>
      </Box>
    ) : (
      <PropertyPanelContent
        onClose={onClose}
        focusTab={focusTab}
        onFocusTabConsumed={onFocusTabConsumed}
        draggable={overlay}
        overlay={overlay}
        pinned={pinned}
        onPinToggle={onPinToggle}
        maximized={Boolean(
          rect &&
            parentSize.width > 80 &&
            (overlay ? isMaximizedRect(rect, parentSize) : isDockedMaximized(rect, parentSize))
        )}
        onMaximize={() => maximize(overlay ? 'overlay' : 'docked')}
      />
    )

  return (
    <>
      <OverlayPanelSync
        id='property'
        visible
        overlay={overlay}
        rect={rect}
        corner='right'
        applyLayout={layoutCommit}
        restoreUser={restoreUser}
      />
      {overlay ? (
        <BuilderFloatingFrame
          overlay
          overlayId='property'
          side='right'
          rect={rect}
          onCommit={handleCommit}
          onEnsureLayout={handleEnsureLayout}
        >
          {content}
        </BuilderFloatingFrame>
      ) : (
        <BuilderFloatingFrame
          overlay={false}
          side='right'
          rect={rect}
          onCommit={handleCommit}
          onEnsureLayout={handleEnsureLayout}
        >
          {content}
        </BuilderFloatingFrame>
      )}
    </>
  )
}

export function PropertyPanel({
  open,
  onClose,
  onOpen,
  overlay = false,
  highlighted = false,
  focusTab,
  onFocusTabConsumed,
  pinned = false,
  onPinToggle
}: Props) {
  if (!open) {
    return <PropertyPanelRail highlighted={highlighted} onClose={onClose} onOpen={onOpen} />
  }

  return (
    <PropertyPanelFrame
      overlay={overlay}
      onClose={onClose}
      focusTab={focusTab}
      onFocusTabConsumed={onFocusTabConsumed}
      pinned={pinned}
      onPinToggle={onPinToggle ?? (() => undefined)}
    />
  )
}
