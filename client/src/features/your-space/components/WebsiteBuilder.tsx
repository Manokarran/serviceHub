'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { useSearchParams } from 'next/navigation'

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

import { BUILDER_FONT_SMOOTHING } from '../constants/builderLayout'
import { builderShellSx } from '../constants/builderChrome'
import { BuilderProvider, useBuilder } from '../context/BuilderContext'
import { BuilderNestTargetsProvider, useBuilderNestTargets } from '../context/BuilderNestTargetsContext'
import type { WebsiteBuilderProps } from '../websiteBuilder.types'
import type { ActiveDragItem, BlockType } from '../types'
import { resolveDropTarget } from '../utils/blockTreeUtils'
import { builderCollisionDetection, pickPreferredDropTargetId } from '../utils/builderCollisionDetection'
import { BuilderCanvas } from './BuilderCanvas'
import { BuilderDragOverlay } from './dnd/BuilderDragOverlay'
import { BuilderDockPanel } from './BuilderDockPanel'
import { BuilderMobileDrawers } from './BuilderMobileDrawers'
import { BuilderSidebar } from './BuilderSidebar'
import { BuilderToolbar } from './BuilderToolbar'
import { BuilderAiButton } from './BuilderAiButton'
import { AiWebsiteChat } from './AiWebsiteChat'
import { PropertyPanel } from './PropertyPanel'
import type { PropertyPanelTab } from '../components/property/PropertyPanelUi'
import { BuilderShellProvider } from '../context/BuilderShellContext'
import { useBuilderFullscreen } from '../hooks/useBuilderFullscreen'
import { useBuilderLeftChrome } from '../hooks/useBuilderLeftChrome'
import { useBuilderPropertyChrome } from '../hooks/useBuilderPropertyChrome'
import { useFloatingPanelRect } from '../hooks/useFloatingPanelRect'
import { BUILDER_AI_CHAT_FRAME_KEY, BUILDER_LEFT_FRAME_KEY } from '../utils/builderPanelFrame'
import { BuilderTemplateLauncher } from '@/features/site-templates/components/BuilderTemplateLauncher'
import { TenantLocationScope } from './TenantLocationScope'

function WebsiteBuilderInner({ tenantName }: { tenantName: string }) {
  const theme = useTheme()
  const isMobileLayout = useMediaQuery(theme.breakpoints.down('lg'))
  const searchParams = useSearchParams()
  const builderRootRef = useRef<HTMLDivElement>(null)
  const { isFullscreen, toggleFullscreen } = useBuilderFullscreen()

  const { blocks, mode, selectedBlock, addBlock, moveBlock } = useBuilder()
  const { hints: nestHints, setCanvasDragging } = useBuilderNestTargets()
  const [activeDrag, setActiveDrag] = useState<ActiveDragItem | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [pagesOpen, setPagesOpen] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const [stylesOpen, setStylesOpen] = useState(false)
  const [aiChatOpen, setAiChatOpen] = useState(() => searchParams.get('aiChat') === '1')
  const [aiChatPinned, setAiChatPinned] = useState(false)
  const { leftPanel, leftPinned, chromeReady, togglePanel, closePanel, togglePinned } = useBuilderLeftChrome()
  const leftFrame = useFloatingPanelRect(BUILDER_LEFT_FRAME_KEY, 'left')
  const aiChatFrame = useFloatingPanelRect(BUILDER_AI_CHAT_FRAME_KEY, 'left')
  const { propertyPinned, propertyChromeReady, togglePropertyPinned } = useBuilderPropertyChrome()
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(false)
  const [propertyPanelFocusTab, setPropertyPanelFocusTab] = useState<PropertyPanelTab | null>(null)
  const lastOpenedBlockId = useRef<string | null>(null)

  const openPropertyPanel = useCallback(
    (tab?: PropertyPanelTab) => {
      setPropertyPanelOpen(true)

      if (isMobileLayout) {
        setPropertiesOpen(true)
      }

      if (tab) {
        setPropertyPanelFocusTab(tab)
      }
    },
    [isMobileLayout]
  )

  const openAiChat = useCallback(() => {
    closePanel()
    setAiChatOpen(true)
  }, [closePanel])

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
      setPropertyPanelOpen(false)
      setAiChatOpen(false)
    }
  }, [isEditMode])

  useEffect(() => {
    if (!isEditMode || isMobileLayout) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const target = event.target as HTMLElement | null

      if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
        return
      }

      if (event.key === 'Escape') {
        if (propertyPanelOpen && !propertyPinned) {
          event.preventDefault()
          event.stopPropagation()
          setPropertyPanelOpen(false)

          return
        }

        if (leftPanel && !leftPinned) {
          event.preventDefault()
          event.stopPropagation()
          closePanel()

          return
        }
      }

      if (event.repeat) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === 'b') {
        event.preventDefault()
        togglePanel('blocks')
      } else if (key === 'p') {
        event.preventDefault()
        togglePanel('pages')
      } else if (key === 's') {
        event.preventDefault()
        togglePanel('design')
      }
    }

    window.addEventListener('keydown', onKeyDown, true)

    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [closePanel, isEditMode, isMobileLayout, leftPanel, leftPinned, propertyPanelOpen, propertyPinned, togglePanel])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as ActiveDragItem | undefined

      if (data) {
        setActiveDrag(data)
        setCanvasDragging(true)
      }
    },
    [setCanvasDragging]
  )

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
      <Box sx={{ position: 'relative', width: '100%' }}>
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
            {isEditMode && !isMobileLayout && aiChatOpen && aiChatPinned && (
              <AiWebsiteChat
                open
                pinned
                rect={aiChatFrame.rect}
                onCommit={aiChatFrame.commit}
                onEnsureLayout={aiChatFrame.ensureLayout}
                onMaximize={aiChatFrame.maximize}
                onPinnedChange={setAiChatPinned}
                onClose={() => setAiChatOpen(false)}
              />
            )}

            {isEditMode && !isMobileLayout && <BuilderSidebar activePanel={leftPanel} onToggle={togglePanel} />}

            {isEditMode && !isMobileLayout && chromeReady && leftPanel !== null && leftPinned && (
              <BuilderDockPanel
                panel={leftPanel}
                onClose={closePanel}
                pinned={leftPinned}
                onPinToggle={togglePinned}
                rect={leftFrame.rect}
                parentSize={leftFrame.parentSize}
                onCommit={leftFrame.commit}
                onEnsureLayout={leftFrame.ensureLayout}
                onMaximize={leftFrame.maximize}
              />
            )}

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                minHeight: 0,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {isEditMode && !isMobileLayout && chromeReady && leftPanel !== null && !leftPinned && (
                <BuilderDockPanel
                  panel={leftPanel}
                  onClose={closePanel}
                  pinned={leftPinned}
                  onPinToggle={togglePinned}
                  overlay
                  rect={leftFrame.rect}
                  parentSize={leftFrame.parentSize}
                  onCommit={leftFrame.commit}
                  onEnsureLayout={leftFrame.ensureLayout}
                  onMaximize={leftFrame.maximize}
                />
              )}

              <BuilderCanvas isMobileLayout={isMobileLayout} />

              {(!aiChatPinned || isMobileLayout) && (
                <AiWebsiteChat
                  open={aiChatOpen}
                  pinned={false}
                  rect={aiChatFrame.rect}
                  onCommit={aiChatFrame.commit}
                  onEnsureLayout={aiChatFrame.ensureLayout}
                  onMaximize={aiChatFrame.maximize}
                  onPinnedChange={setAiChatPinned}
                  onClose={() => setAiChatOpen(false)}
                />
              )}

              {isEditMode && !isMobileLayout && propertyChromeReady && propertyPanelOpen && !propertyPinned && (
                <PropertyPanel
                  open
                  overlay
                  pinned={propertyPinned}
                  onPinToggle={togglePropertyPinned}
                  onClose={() => setPropertyPanelOpen(false)}
                  onOpen={() => setPropertyPanelOpen(true)}
                  focusTab={propertyPanelFocusTab}
                  onFocusTabConsumed={() => setPropertyPanelFocusTab(null)}
                />
              )}
            </Box>

            {isEditMode && !isMobileLayout && propertyChromeReady && propertyPanelOpen && propertyPinned && (
              <PropertyPanel
                open
                pinned={propertyPinned}
                onPinToggle={togglePropertyPinned}
                onClose={() => setPropertyPanelOpen(false)}
                onOpen={() => setPropertyPanelOpen(true)}
                focusTab={propertyPanelFocusTab}
                onFocusTabConsumed={() => setPropertyPanelFocusTab(null)}
              />
            )}

            {isEditMode && !isMobileLayout && !(propertyPanelOpen && propertyPinned) && (
              <PropertyPanel
                open={false}
                highlighted={propertyPanelOpen}
                onClose={() => setPropertyPanelOpen(false)}
                onOpen={() => setPropertyPanelOpen(true)}
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
        {isEditMode && (
          <Box
            onClick={event => event.stopPropagation()}
            sx={{
              position: 'fixed',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              zIndex: 200
            }}
          >
            <BuilderAiButton compact={isMobileLayout} floating onClick={openAiChat} />
          </Box>
        )}
      </Box>
    </BuilderShellProvider>
  )
}

function WebsiteBuilderContent({
  tenantSlug,
  tenantName,
  tenantLocation,
  builderScope = 'organization',
  libraryTemplateId = null,
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
  const builder = (
    <BuilderProvider
      tenantSlug={tenantSlug}
      tenantLocation={tenantLocation}
      builderScope={builderScope}
      libraryTemplateId={libraryTemplateId}
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
  )

  const scopedBuilder = <TenantLocationScope location={tenantLocation}>{builder}</TenantLocationScope>

  if (builderScope === 'base_template' || builderScope === 'library_template') {
    return scopedBuilder
  }

  return (
    <BuilderTemplateLauncher tenantSlug={tenantSlug} isSiteStarted={isSiteStarted} extraPageCount={extraPageCount}>
      {scopedBuilder}
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
