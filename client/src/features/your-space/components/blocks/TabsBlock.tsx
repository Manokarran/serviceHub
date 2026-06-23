'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { alpha, useTheme } from '@mui/material/styles'

import type { Block, TabPanel, TabsBlockProps } from '../../types'
import { createBlockId } from '../../utils/blockFactory'
import {
  getTabButtonSx,
  getTabContentAnimationSx,
  getTabIndicatorSx,
  getTabsContainerSx,
  getTabsContentSx,
  getTabsListSx,
  getTabsMaxWidth,
  getTabsShellSx
} from '../../utils/tabStyleHelpers'
import { useBuilderOptional } from '../../context/BuilderContext'
import { siteCanvasBelow } from '../../utils/siteResponsiveHelpers'
import { TabsDropZone } from '../dnd/TabsDropZone'
import { TabsEditChip } from '../inline/TabsEditChip'

type Props = {
  block: Block
  preview?: boolean
}

type IndicatorState = {
  left: number
  top: number
  width: number
  height: number
}

const EMPTY_INDICATOR: IndicatorState = { left: 0, top: 0, width: 0, height: 0 }

function TabNavButton({
  label,
  icon,
  isActive,
  props,
  onClick,
  onLabelChange,
  editMode,
  onRemove,
  canRemove,
  buttonRef
}: {
  label: string
  icon?: string
  isActive: boolean
  props: TabsBlockProps
  onClick: () => void
  onLabelChange?: (label: string) => void
  editMode: boolean
  onRemove?: () => void
  canRemove: boolean
  buttonRef?: (node: HTMLButtonElement | null) => void
}) {
  const theme = useTheme()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)

  useEffect(() => {
    setDraft(label)
  }, [label])

  const commitLabel = () => {
    setEditing(false)
    const trimmed = draft.trim()

    if (trimmed && trimmed !== label) {
      onLabelChange?.(trimmed)
    } else {
      setDraft(label)
    }
  }

  const iconSize = props.orientation === 'vertical' ? '0.875rem' : '0.9375rem'

  return (
    <Box data-tab-button-wrapper sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 0 }}>
      {editMode && editing ? (
        <TextField
          autoFocus
          size='small'
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              commitLabel()
            }

            if (e.key === 'Escape') {
              setDraft(label)
              setEditing(false)
            }
          }}
          onClick={e => e.stopPropagation()}
          sx={{
            minWidth: 100,
            '& .MuiInputBase-input': { py: 0.75, px: 1.25, fontSize: '0.8125rem', fontWeight: 600 }
          }}
        />
      ) : (
        <Box
          component='button'
          type='button'
          role='tab'
          aria-selected={isActive}
          ref={buttonRef}
          onClick={onClick}
          onDoubleClick={
            editMode
              ? e => {
                  e.stopPropagation()
                  setEditing(true)
                }
              : undefined
          }
          sx={getTabButtonSx(props, isActive, theme)}
        >
          {icon && (
            <i
              className={icon}
              style={{
                fontSize: iconSize,
                opacity: isActive ? 1 : 0.65,
                flexShrink: 0,
                lineHeight: 1
              }}
            />
          )}
          {label}
        </Box>
      )}
      {editMode && canRemove && onRemove && (
        <Box
          component='button'
          type='button'
          onClick={e => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remove ${label} tab`}
          sx={{
            border: 'none',
            cursor: 'pointer',
            width: 20,
            height: 20,
            borderRadius: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
            backgroundColor: 'transparent',
            flexShrink: 0,
            '&:hover': { color: 'error.main', backgroundColor: alpha(theme.palette.error.main, 0.08) }
          }}
        >
          <i className='ri-close-line' style={{ fontSize: '0.75rem' }} />
        </Box>
      )}
    </Box>
  )
}

function TabList({
  tabs,
  activeIndex,
  props,
  onSelect,
  editMode,
  onLabelChange,
  onRemove,
  canRemove
}: {
  tabs: TabPanel[]
  activeIndex: number
  props: TabsBlockProps
  onSelect: (index: number) => void
  editMode: boolean
  onLabelChange?: (index: number, label: string) => void
  onRemove?: (index: number) => void
  canRemove: boolean
}) {
  const theme = useTheme()
  const listRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState<IndicatorState>(EMPTY_INDICATOR)
  const [useVerticalIndicator, setUseVerticalIndicator] = useState(false)
  const showIndicator = props.variant === 'underline'

  const updateIndicator = useCallback(() => {
    if (!showIndicator) {
      return
    }

    const listEl = listRef.current
    const activeEl = buttonRefs.current[activeIndex]

    if (!listEl || !activeEl) {
      return
    }

    const computedDirection = getComputedStyle(listEl).flexDirection
    const isVerticalBar = props.orientation === 'vertical' && computedDirection === 'column'

    setUseVerticalIndicator(isVerticalBar)

    const listRect = listEl.getBoundingClientRect()
    const tabRect = activeEl.getBoundingClientRect()

    if (isVerticalBar) {
      setIndicator({
        left: 0,
        top: tabRect.top - listRect.top + listEl.scrollTop,
        width: 3,
        height: tabRect.height
      })
    } else {
      setIndicator({
        left: tabRect.left - listRect.left + listEl.scrollLeft,
        top: 0,
        width: tabRect.width,
        height: 3
      })
    }
  }, [activeIndex, props.orientation, showIndicator])

  useLayoutEffect(() => {
    updateIndicator()
  }, [updateIndicator, tabs.length, props.tabGap, props.fullWidthTabs, props.orientation])

  useEffect(() => {
    const activeEl = buttonRefs.current[activeIndex]

    activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeIndex, tabs.length])

  useEffect(() => {
    if (!showIndicator) {
      return
    }

    const listEl = listRef.current

    if (!listEl) {
      return
    }

    const observer = new ResizeObserver(updateIndicator)

    observer.observe(listEl)
    buttonRefs.current.forEach(button => {
      if (button) {
        observer.observe(button)
      }
    })

    return () => observer.disconnect()
  }, [showIndicator, updateIndicator, tabs.length, activeIndex])

  useEffect(() => {
    const listEl = listRef.current

    if (!listEl || !showIndicator) {
      return
    }

    const handleScroll = () => updateIndicator()

    listEl.addEventListener('scroll', handleScroll, { passive: true })

    return () => listEl.removeEventListener('scroll', handleScroll)
  }, [showIndicator, updateIndicator])

  return (
    <Box role='tablist' aria-orientation={props.orientation} ref={listRef} sx={getTabsListSx(props, theme)}>
      {showIndicator && indicator.width > 0 && (
        <Box aria-hidden sx={getTabIndicatorSx(props, indicator, useVerticalIndicator)} />
      )}
      {tabs.map((tab, index) => (
        <TabNavButton
          key={tab.id}
          label={tab.label}
          icon={tab.icon}
          isActive={activeIndex === index}
          props={props}
          onClick={() => onSelect(index)}
          onLabelChange={onLabelChange ? label => onLabelChange(index, label) : undefined}
          editMode={editMode}
          onRemove={onRemove ? () => onRemove(index) : undefined}
          canRemove={canRemove}
          buttonRef={node => {
            buttonRefs.current[index] = node
          }}
        />
      ))}
    </Box>
  )
}

function AnimatedTabContent({
  panel,
  props,
  slideDirection,
  children
}: {
  panel: TabPanel
  props: TabsBlockProps
  slideDirection: 'left' | 'right' | 'none'
  children: React.ReactNode
}) {
  const theme = useTheme()
  const animation = props.contentAnimation ?? 'fade'
  const duration = props.animationDuration ?? 280

  const contentSx = {
    ...(getTabsContentSx(props, theme) as object),
    p: 2,
    ...siteCanvasBelow({ p: 1.5 }),
    ...(getTabContentAnimationSx(animation, duration, slideDirection) as object)
  }

  return (
    <Box key={panel.id} role='tabpanel' sx={contentSx}>
      {children}
    </Box>
  )
}

function TabManagementBar({
  tabs,
  activeIndex,
  props,
  onSelect,
  onAdd,
  onRemove,
  onLabelChange
}: {
  tabs: TabPanel[]
  activeIndex: number
  props: TabsBlockProps
  onSelect: (index: number) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onLabelChange: (index: number, label: string) => void
}) {
  const theme = useTheme()

  return (
    <Box sx={{ mb: 1, minWidth: 0, width: '100%' }}>
      <TabList
        tabs={tabs}
        activeIndex={activeIndex}
        props={props}
        onSelect={onSelect}
        editMode
        onLabelChange={onLabelChange}
        onRemove={onRemove}
        canRemove={tabs.length > 1}
      />
      <Box
        component='button'
        type='button'
        onClick={onAdd}
        sx={{
          border: 'none',
          cursor: 'pointer',
          mt: 0.75,
          px: 1,
          py: 0.375,
          borderRadius: 1,
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'text.secondary',
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          '&:hover': {
            color: 'primary.main',
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
          }
        }}
      >
        <i className='ri-add-line' style={{ fontSize: '0.8rem' }} />
        Add tab
      </Box>
    </Box>
  )
}

function TabsShell({ block, preview }: Props) {
  const theme = useTheme()
  const builder = useBuilderOptional()
  const props = block.props as TabsBlockProps
  const editMode = !preview
  const maxWidth = getTabsMaxWidth(props.maxWidth)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [prevTabIndex, setPrevTabIndex] = useState(0)

  useEffect(() => {
    if (activeTabIndex >= props.tabs.length) {
      setActiveTabIndex(Math.max(0, props.tabs.length - 1))
    }
  }, [activeTabIndex, props.tabs.length])

  const selectTab = (index: number) => {
    setPrevTabIndex(activeTabIndex)
    setActiveTabIndex(index)
  }

  const slideDirection =
    activeTabIndex === prevTabIndex
      ? 'none'
      : activeTabIndex > prevTabIndex
        ? 'right'
        : 'left'

  const activePanel = props.tabs[activeTabIndex] ?? props.tabs[0]

  const handleAddTab = () => {
    if (!builder) {
      return
    }

    const nextIndex = props.tabs.length + 1
    const newPanel: TabPanel = {
      id: createBlockId(),
      label: `Tab ${nextIndex}`,
      children: []
    }

    const nextTabs = [...props.tabs, newPanel]

    builder.updateBlock(block.id, { tabs: nextTabs })
    selectTab(nextTabs.length - 1)
  }

  const handleRemoveTab = (index: number) => {
    if (!builder || props.tabs.length <= 1) {
      return
    }

    const nextTabs = props.tabs.filter((_, i) => i !== index)

    builder.updateBlock(block.id, { tabs: nextTabs })
    selectTab(Math.min(activeTabIndex, nextTabs.length - 1))
  }

  const handleLabelChange = (index: number, label: string) => {
    if (!builder) {
      return
    }

    const nextTabs = props.tabs.map((tab, i) => (i === index ? { ...tab, label } : tab))

    builder.updateBlock(block.id, { tabs: nextTabs })
  }

  const panelContent = (panel: TabPanel) => (
    <TabsDropZone
      tabsId={block.id}
      panelId={panel.id}
      children={panel.children}
      editMode={editMode}
      emptyLabel='Drop heading, text, button, image, video, logo, or shape blocks here'
    />
  )

  return (
    <Box component='section' sx={{ position: 'relative', ...getTabsShellSx(props) }}>
      {editMode && <TabsEditChip tabsId={block.id} />}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: typeof maxWidth === 'number' ? maxWidth : maxWidth,
          mx: props.maxWidth === 'full' ? 0 : 'auto',
          minWidth: 0,
          width: '100%'
        }}
      >
        {editMode ? (
          <>
            <TabManagementBar
              tabs={props.tabs}
              activeIndex={activeTabIndex}
              props={props}
              onSelect={selectTab}
              onAdd={handleAddTab}
              onRemove={handleRemoveTab}
              onLabelChange={handleLabelChange}
            />
            {activePanel && (
              <AnimatedTabContent panel={activePanel} props={props} slideDirection={slideDirection}>
                {panelContent(activePanel)}
              </AnimatedTabContent>
            )}
          </>
        ) : (
          <Box sx={getTabsContainerSx(props)}>
            <TabList
              tabs={props.tabs}
              activeIndex={activeTabIndex}
              props={props}
              onSelect={selectTab}
              editMode={false}
              canRemove={false}
            />
            {activePanel && (
              <AnimatedTabContent panel={activePanel} props={props} slideDirection={slideDirection}>
                {panelContent(activePanel)}
              </AnimatedTabContent>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export function TabsBlock({ block, preview = false }: Props) {
  return <TabsShell block={block} preview={preview} />
}

export function TabsBlockPreview({ block }: { block: Block }) {
  return <TabsShell block={block} preview />
}
