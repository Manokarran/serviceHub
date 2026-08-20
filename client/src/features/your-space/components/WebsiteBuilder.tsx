'use client'

import { Suspense } from 'react'

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
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import type { SiteStyles } from '../types/siteStyles'
import { BUILDER_FONT_SMOOTHING } from '../constants/builderLayout'
import { builderShellSx } from '../constants/builderChrome'
import { BuilderProvider, useBuilder } from '../context/BuilderContext'
import { BuilderNestTargetsProvider, useBuilderNestTargets } from '../context/BuilderNestTargetsContext'
import type { PublishedVersionSummary, SitePageSummary } from '@/models/site-page'
import type { ActiveDragItem, Block, BlockType } from '../types'
import { resolveDropTarget } from '../utils/blockTreeUtils'
import { builderCollisionDetection, pickPreferredDropTargetId } from '../utils/builderCollisionDetection'
import { BuilderCanvas } from './BuilderCanvas'
import { BuilderDragOverlay } from './dnd/BuilderDragOverlay'
import { BuilderDockPanel } from './BuilderDockPanel'
import { BuilderMobileDrawers } from './BuilderMobileDrawers'
import { BuilderSidebar } from './BuilderSidebar'
import { BuilderToolbar } from './BuilderToolbar'
import { PropertyPanel } from './PropertyPanel'
import type { PropertyPanelTab } from '../components/property/PropertyPanelUi'
import { BuilderShellProvider } from '../context/BuilderShellContext'
import { useBuilderFullscreen } from '../hooks/useBuilderFullscreen'
import { BuilderTemplateLauncher } from '@/features/site-templates/components/BuilderTemplateLauncher'

type WebsiteBuilderInnerProps = {
  tenantName: string
}

function WebsiteBuilderInner({ tenantName }: { tenantName: string }) {
  const theme = useTheme()
  const isMobileLayout = useMediaQuery(theme.breakpoints.down('lg'))
  const builderRootRef = useRef<HTMLDivElement>(null)
  const { isFullscreen, toggleFullscreen } = useBuilderFullscreen()

  const { blocks, mode, selectedBlock, addBlock, moveBlock } = useBuilder()
  const { hints: nestHints, setCanvasDragging } = useBuilderNestTargets()
  const [activeDrag, setActiveDrag] = useState<ActiveDragItem | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [pagesOpen, setPagesOpen] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const [stylesOpen, setStylesOpen] = useState(false)
  // Left panel: which panel is open (null = collapsed — icon rail only)
  const [leftPanel, setLeftPanel] = useState<'pages' | 'blocks' | 'design' | null>(null)
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(false)
  const [propertyPanelFocusTab, setPropertyPanelFocusTab] = useState<PropertyPanelTab | null>(null)
  const lastOpenedBlockId = useRef<string | null>(null)

  const handleLeftPanelToggle = useCallback((panel: 'pages' | 'blocks' | 'design') => {
    setLeftPanel(prev => (prev === panel ? null : panel))
  }, [])

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

    if (isEditMode) {
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
      setPagesOpen(false)
      setPropertiesOpen(false)
      setStylesOpen(false)
      setLeftPanel(null)
      setPropertyPanelOpen(false)
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
      setCanvasDragging(true)
    }
  }, [setCanvasDragging])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null)
      setCanvasDragging(false)

      const { active, over } = event

      if (!over) {
        return
      }

      const dropOverId = pickPreferredDropTargetId(over.id, event.collisions)

      if (dropOverId === undefined) {
        return
      }

      const activeData = active.data.current as ActiveDragItem | undefined

      if (!activeData) {
        return
      }

      if (activeData.source === 'palette') {
        const type = activeData.type as BlockType
        const target = resolveDropTarget(blocks, dropOverId, type, nestHints)

        addBlock(type, target, activeData.paletteId)

        if (isMobileLayout) {
          setPaletteOpen(false)
        }

        return
      }

      if (activeData.source === 'canvas') {
        moveBlock(String(active.id), dropOverId, nestHints)
      }
    },
    [addBlock, blocks, isMobileLayout, moveBlock, nestHints, setCanvasDragging]
  )

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null)
    setCanvasDragging(false)
  }, [setCanvasDragging])

  return (
    <BuilderShellProvider openPropertyPanel={openPropertyPanel}>
      <DndContext
      sensors={sensors}
      collisionDetection={builderCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
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
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => void toggleFullscreen(builderRootRef.current)}
        />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {isEditMode && !isMobileLayout && (
            <BuilderSidebar activePanel={leftPanel} onToggle={handleLeftPanelToggle} />
          )}

          {isEditMode && !isMobileLayout && leftPanel !== null && (
            <BuilderDockPanel panel={leftPanel} onClose={() => setLeftPanel(null)} />
          )}

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
            <BuilderCanvas isMobileLayout={isMobileLayout} />
          </Box>

          {isEditMode && !isMobileLayout && (
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
            pagesOpen={pagesOpen}
            paletteOpen={paletteOpen}
            propertiesOpen={propertiesOpen}
            stylesOpen={stylesOpen}
            hasSelectedBlock={Boolean(selectedBlock)}
            propertyPanelFocusTab={propertyPanelFocusTab}
            onPropertyPanelFocusTabConsumed={() => setPropertyPanelFocusTab(null)}
            onPagesOpen={() => setPagesOpen(true)}
            onPagesClose={() => setPagesOpen(false)}
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
        <BuilderDragOverlay activeDrag={activeDrag} blocks={blocks} />
      </DragOverlay>
    </DndContext>
    </BuilderShellProvider>
  )
}

type WebsiteBuilderProps = {
  tenantSlug: string
  tenantName: string
  initialPageSlug: string
  initialPages: SitePageSummary[]
  initialPageTitle: string
  initialDraftBlocks: Block[] | null
  initialPublishedBlocks: Block[]
  initialSavedAt: string | null
  initialPublishedAt: string | null
  initialDraftSiteStyles: SiteStyles | null
  initialPublishedSiteStyles: SiteStyles | null
  initialVersions: PublishedVersionSummary[]
  isSiteStarted: boolean
  extraPageCount: number
}

function WebsiteBuilderContent({
  tenantSlug,
  tenantName,
  initialPageSlug,
  initialPages,
  initialPageTitle,
  initialDraftBlocks,
  initialPublishedBlocks,
  initialSavedAt,
  initialPublishedAt,
  initialDraftSiteStyles,
  initialPublishedSiteStyles,
  initialVersions,
  isSiteStarted,
  extraPageCount
}: WebsiteBuilderProps) {
  return (
    <BuilderTemplateLauncher
      tenantSlug={tenantSlug}
      isSiteStarted={isSiteStarted}
      extraPageCount={extraPageCount}
    >
      <BuilderProvider
        tenantSlug={tenantSlug}
        initialPageSlug={initialPageSlug}
        initialPages={initialPages}
        initialPageTitle={initialPageTitle}
        initialDraftBlocks={initialDraftBlocks}
        initialPublishedBlocks={initialPublishedBlocks}
        initialDraftSiteStyles={initialDraftSiteStyles}
        initialPublishedSiteStyles={initialPublishedSiteStyles}
        initialSavedAt={initialSavedAt}
        initialPublishedAt={initialPublishedAt}
        initialVersions={initialVersions}
      >
        <BuilderNestTargetsProvider>
          <WebsiteBuilderInner tenantName={tenantName} />
        </BuilderNestTargetsProvider>
      </BuilderProvider>
    </BuilderTemplateLauncher>
  )
}

export function WebsiteBuilder(props: WebsiteBuilderProps) {
  return (
    <Suspense fallback={null}>
      <WebsiteBuilderContent {...props} />
    </Suspense>
  )
}
