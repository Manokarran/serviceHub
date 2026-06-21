'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import type { SiteStyles } from '../types/siteStyles'
import { getPaletteItem } from '../constants'
import { BUILDER_FONT_SMOOTHING, BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import { builderShellSx } from '../constants/builderChrome'
import { BuilderProvider, useBuilder } from '../context/BuilderContext'
import type { PublishedVersionSummary } from '@/models/site-page'
import type { ActiveDragItem, Block, BlockType } from '../types'
import { resolveDropTarget } from '../utils/blockTreeUtils'
import { builderCollisionDetection } from '../utils/builderCollisionDetection'
import { BuilderCanvas } from './BuilderCanvas'
import { BuilderMobileDrawers } from './BuilderMobileDrawers'
import { BuilderSidebar } from './BuilderSidebar'
import { BuilderToolbar } from './BuilderToolbar'
import { PropertyPanel } from './PropertyPanel'
import type { PropertyPanelTab } from '../components/property/PropertyPanelUi'
import { BuilderShellProvider } from '../context/BuilderShellContext'
import { useBuilderFullscreen } from '../hooks/useBuilderFullscreen'

type WebsiteBuilderInnerProps = {
  tenantName: string
  siteUrl: string
  displayUrl: string
}

function WebsiteBuilderInner({ tenantName, siteUrl, displayUrl }: WebsiteBuilderInnerProps) {
  const theme = useTheme()
  const isMobileLayout = useMediaQuery(theme.breakpoints.down('lg'))
  const builderRootRef = useRef<HTMLDivElement>(null)
  const { isFullscreen, toggleFullscreen } = useBuilderFullscreen()

  const { blocks, mode, selectedBlock, addBlock, moveBlock } = useBuilder()
  const [activeDrag, setActiveDrag] = useState<ActiveDragItem | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const [stylesOpen, setStylesOpen] = useState(false)
  const [sidebarPanelOpen, setSidebarPanelOpen] = useState(true)
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(true)
  const [propertyPanelFocusTab, setPropertyPanelFocusTab] = useState<PropertyPanelTab | null>(null)
  const lastOpenedBlockId = useRef<string | null>(null)

  const openPropertyPanel = useCallback((tab?: PropertyPanelTab) => {
    setPropertyPanelOpen(true)

    if (isMobileLayout) {
      setPropertiesOpen(true)
    }

    if (tab) {
      setPropertyPanelFocusTab(tab)
    }
  }, [isMobileLayout])

  const isEditMode = mode === 'edit'

  useEffect(() => {
    if (!selectedBlock) {
      setPropertiesOpen(false)
      lastOpenedBlockId.current = null

      return
    }

    if (isEditMode && selectedBlock.id !== lastOpenedBlockId.current) {
      setPropertyPanelOpen(true)

      if (isMobileLayout) {
        setPropertiesOpen(true)
      }

      lastOpenedBlockId.current = selectedBlock.id
    }
  }, [selectedBlock, isMobileLayout, isEditMode])

  useEffect(() => {
    if (!isEditMode) {
      setPaletteOpen(false)
      setPropertiesOpen(false)
      setStylesOpen(false)
      setSidebarPanelOpen(true)
      setPropertyPanelOpen(true)
    }
  }, [isEditMode])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as ActiveDragItem | undefined

    if (data) {
      setActiveDrag(data)
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null)

      const { active, over } = event

      if (!over) {
        return
      }

      const activeData = active.data.current as ActiveDragItem | undefined

      if (!activeData) {
        return
      }

      if (activeData.source === 'palette') {
        const type = activeData.type as BlockType
        const target = resolveDropTarget(blocks, over.id, type)

        addBlock(type, target, activeData.paletteId)

        if (isMobileLayout) {
          setPaletteOpen(false)
        }

        return
      }

      if (activeData.source === 'canvas') {
        moveBlock(String(active.id), over.id)
      }
    },
    [addBlock, blocks, isMobileLayout, moveBlock]
  )

  const dragOverlayLabel = activeDrag
    ? getPaletteItem(activeDrag.paletteId, activeDrag.type)?.label ??
      (activeDrag.blockId ? 'Moving block' : activeDrag.type)
    : null

  return (
    <BuilderShellProvider openPropertyPanel={openPropertyPanel}>
      <DndContext
      sensors={sensors}
      collisionDetection={builderCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box
        ref={builderRootRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: isFullscreen ? '100vh' : 'calc(100vh - 64px - 48px)',
          minHeight: isFullscreen ? '100vh' : 560,
          mx: isFullscreen ? 0 : { xs: -4, sm: -6 },
          mt: isFullscreen ? 0 : { xs: -4, sm: -6 },
          backgroundColor: 'background.default',
          ...BUILDER_FONT_SMOOTHING,
          ...builderShellSx(theme, isFullscreen)
        }}
      >
        <BuilderToolbar
          tenantName={tenantName}
          siteUrl={siteUrl}
          displayUrl={displayUrl}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => void toggleFullscreen(builderRootRef.current)}
        />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
          {isEditMode && (
            <BuilderSidebar
              panelOpen={sidebarPanelOpen}
              onPanelClose={() => setSidebarPanelOpen(false)}
              onPanelOpen={() => setSidebarPanelOpen(true)}
            />
          )}
          <BuilderCanvas isMobileLayout={isMobileLayout} />
          {isEditMode && (
            <PropertyPanel
              open={propertyPanelOpen}
              onClose={() => setPropertyPanelOpen(false)}
              onOpen={() => setPropertyPanelOpen(true)}
              focusTab={propertyPanelFocusTab}
              onFocusTabConsumed={() => setPropertyPanelFocusTab(null)}
            />
          )}
        </Box>
        {isEditMode && isMobileLayout && (
          <BuilderMobileDrawers
            paletteOpen={paletteOpen}
            propertiesOpen={propertiesOpen}
            stylesOpen={stylesOpen}
            hasSelectedBlock={Boolean(selectedBlock)}
            propertyPanelFocusTab={propertyPanelFocusTab}
            onPropertyPanelFocusTabConsumed={() => setPropertyPanelFocusTab(null)}
            onPaletteOpen={() => setPaletteOpen(true)}
            onPaletteClose={() => setPaletteOpen(false)}
            onPropertiesOpen={() => setPropertiesOpen(true)}
            onPropertiesClose={() => setPropertiesOpen(false)}
            onStylesOpen={() => setStylesOpen(true)}
            onStylesClose={() => setStylesOpen(false)}
          />
        )}
      </Box>
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeDrag && dragOverlayLabel ? (
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'grabbing'
            }}
          >
            <i className='ri-drag-drop-line' />
            <Typography variant='body2' sx={BUILDER_TYPOGRAPHY.label}>
              {dragOverlayLabel}
            </Typography>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
    </BuilderShellProvider>
  )
}

type WebsiteBuilderProps = {
  tenantSlug: string
  tenantName: string
  siteUrl: string
  displayUrl: string
  initialDraftBlocks: Block[] | null
  initialPublishedBlocks: Block[]
  initialSavedAt: string | null
  initialPublishedAt: string | null
  initialDraftSiteStyles: SiteStyles | null
  initialPublishedSiteStyles: SiteStyles | null
  initialVersions: PublishedVersionSummary[]
}

export function WebsiteBuilder({
  tenantSlug,
  tenantName,
  siteUrl,
  displayUrl,
  initialDraftBlocks,
  initialPublishedBlocks,
  initialSavedAt,
  initialPublishedAt,
  initialDraftSiteStyles,
  initialPublishedSiteStyles,
  initialVersions
}: WebsiteBuilderProps) {
  return (
    <BuilderProvider
      tenantSlug={tenantSlug}
      initialDraftBlocks={initialDraftBlocks}
      initialPublishedBlocks={initialPublishedBlocks}
      initialDraftSiteStyles={initialDraftSiteStyles}
      initialPublishedSiteStyles={initialPublishedSiteStyles}
      initialSavedAt={initialSavedAt}
      initialPublishedAt={initialPublishedAt}
      initialVersions={initialVersions}
    >
      <WebsiteBuilderInner tenantName={tenantName} siteUrl={siteUrl} displayUrl={displayUrl} />
    </BuilderProvider>
  )
}
