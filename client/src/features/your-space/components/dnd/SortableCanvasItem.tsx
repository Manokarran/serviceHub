'use client'

import { useRef, useState, type MouseEvent, type RefObject } from 'react'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

import { useBuilder } from '../../context/BuilderContext'
import { useBuilderShell } from '../../context/BuilderShellContext'
import { useBuilderNestTargetsOptional } from '../../context/BuilderNestTargetsContext'
import { BUILDER_Z_INDEX } from '../../constants/builderLayout'
import type { Block } from '../../types'
import { builderContainerOutlineSx, isContainerBlockType } from '../../utils/builderContainerChrome'
import { listInsertInsideTargets, type QuickAddLocation } from '../../utils/quickAddHelpers'
import type { BlockColumn } from '../../utils/blockTreeUtils'
import { BlockRenderer } from '../blocks/BlockRenderer'
import {
  CanvasBlockEditProvider,
  getPrimaryInlineEditField,
  useCanvasBlockEdit
} from '../inline/CanvasBlockEditContext'
import { BlockInlineToolbar } from '../inline/BlockInlineToolbar'
import { useSmartInlineToolbarPlacement } from '../inline/useSmartInlineToolbarPlacement'
import { BlockQuickAddPicker } from './BlockQuickAddPicker'

type Props = {
  block: Block
  nested?: boolean
  preview?: boolean
  preferToolbarBelow?: boolean
  listLocation?: QuickAddLocation
  blockIndex?: number
}

function SelectedBlockToolbar({
  block,
  nested,
  blockRef,
  onDelete,
  dragHandleProps,
  preferToolbarBelow = false
}: {
  block: Block
  nested: boolean
  blockRef: RefObject<HTMLElement | null>
  onDelete: () => void
  dragHandleProps?: Record<string, unknown>
  preferToolbarBelow?: boolean
}) {
  const editContext = useCanvasBlockEdit()
  const isInlineEditing = Boolean(editContext?.inlineEditingField)
  const toolbarPlacement = useSmartInlineToolbarPlacement(
    blockRef,
    block,
    true,
    isInlineEditing,
    preferToolbarBelow,
    nested
  )

  return (
    <Box
      className='block-inline-toolbar'
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: BUILDER_Z_INDEX.blockToolbar,
        pointerEvents: 'none',
        overflow: 'visible',
        '& > *': { pointerEvents: 'auto' }
      }}
    >
      <BlockInlineToolbar
        block={block}
        nested={nested}
        toolbarPlacement={toolbarPlacement}
        onDelete={onDelete}
        dragHandleProps={dragHandleProps}
      />
    </Box>
  )
}

function BlockEditHost({
  block,
  nested,
  preferToolbarBelow,
  onSelect,
  onDelete,
  dragHandleProps,
  isSelected,
  isEditMode
}: {
  block: Block
  nested: boolean
  preferToolbarBelow: boolean
  onSelect: () => void
  onDelete: () => void
  dragHandleProps: Record<string, unknown>
  isSelected: boolean
  isEditMode: boolean
}) {
  const editContext = useCanvasBlockEdit()
  const blockRef = useRef<HTMLElement | null>(null)
  const isContainerBlock = isContainerBlockType(block.type)

  return (
    <Box
      ref={node => {
        blockRef.current = node instanceof HTMLElement ? node : null
      }}
      onDoubleClick={(e: MouseEvent) => {
        // Nested children handle their own double-clicks first (stopPropagation).
        e.stopPropagation()
        e.preventDefault()
        onSelect()

        if (!isContainerBlock) {
          const field = getPrimaryInlineEditField(block.type)

          if (field) {
            editContext?.requestInlineEdit(field)
          }
        }
      }}
      sx={{ position: 'relative', zIndex: 1, overflow: 'visible' }}
    >
      <BlockRenderer block={block} />
      {isEditMode && isSelected && (
        <SelectedBlockToolbar
          block={block}
          nested={nested}
          blockRef={blockRef}
          onDelete={onDelete}
          dragHandleProps={dragHandleProps}
          preferToolbarBelow={preferToolbarBelow}
        />
      )}
    </Box>
  )
}

export function SortableCanvasItem({
  block,
  nested = false,
  preview = false,
  preferToolbarBelow = false,
  listLocation,
  blockIndex
}: Props) {
  const theme = useTheme()
  const { selectedBlockId, mode, selectBlock, deleteBlock, updateBlock } = useBuilder()
  const shell = useBuilderShell()
  const nestTargets = useBuilderNestTargetsOptional()
  const outerRef = useRef<HTMLElement | null>(null)
  const isSelected = selectedBlockId === block.id
  const isEditMode = mode === 'edit'
  const isPreviewCanvas = preview || mode === 'preview'
  const isContainerBlock = isContainerBlockType(block.type)
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
    preferredColumn?: BlockColumn
  } | null>(null)
  const [quickAdd, setQuickAdd] = useState<{
    anchor: HTMLElement
    index: number
    title: string
    location: QuickAddLocation
  } | null>(null)

  const insideTargets = isContainerBlock
    ? listInsertInsideTargets(block, nestTargets?.hints, contextMenu?.preferredColumn)
    : []

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: isPreviewCanvas,
    data: { source: 'canvas', type: block.type, blockId: block.id }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const setBlockRef = (node: HTMLElement | null) => {
    setNodeRef(node)
    outerRef.current = node
  }

  const selectThisBlock = () => {
    selectBlock(block.id)
    shell?.openPropertyPanel()
  }

  const openQuickAdd = (location: QuickAddLocation, index: number, title: string) => {
    if (!outerRef.current) {
      return
    }

    setContextMenu(null)
    setQuickAdd({ anchor: outerRef.current, index, title, location })
  }

  if (isPreviewCanvas) {
    return <BlockRenderer block={block} preview />
  }

  return (
    <Box
      ref={setBlockRef}
      data-builder-block-id={block.id}
      style={style}
      onClick={e => {
        e.stopPropagation()
        if (isEditMode) {
          selectThisBlock()
        }
      }}
      onContextMenu={e => {
        if (!isEditMode) {
          return
        }

        // Containers can open “Add inside” even without list location; siblings need list coords.
        if (!isContainerBlock && (listLocation == null || blockIndex == null)) {
          return
        }

        e.preventDefault()
        e.stopPropagation()
        selectThisBlock()

        const columnEl = (e.target as HTMLElement | null)?.closest?.('[data-builder-section-column]')
        const preferredColumn = columnEl?.getAttribute('data-builder-section-column') as
          | BlockColumn
          | null
          | undefined

        setContextMenu({
          mouseX: e.clientX + 2,
          mouseY: e.clientY - 6,
          ...(preferredColumn ? { preferredColumn } : {})
        })
      }}
      sx={{
        position: 'relative',
        overflow: 'visible',
        backgroundColor: 'transparent',
        opacity: isDragging ? 0 : 1,
        visibility: isDragging ? 'hidden' : 'visible',
        zIndex: isSelected
          ? BUILDER_Z_INDEX.canvasBlockSelected
          : isDragging
            ? BUILDER_Z_INDEX.canvasBlockDragging
            : nested
              ? 1
              : undefined,
        outline: isEditMode && isSelected ? '2px solid' : '2px solid transparent',
        outlineColor: isEditMode && isSelected ? 'primary.main' : 'transparent',
        outlineOffset: -2,
        '&:has([data-builder-block-id]:hover) > .hover-block-toolbar': {
          opacity: '0 !important',
          pointerEvents: 'none !important'
        },
        ...(isEditMode && isContainerBlock ? builderContainerOutlineSx(theme, isSelected) : {}),
        ...(isEditMode && !isSelected
          ? {
              '&:hover': {
                zIndex: BUILDER_Z_INDEX.canvasBlockHover
              }
            }
          : {}),
        '&:hover > .hover-block-toolbar': isEditMode && !isSelected ? { opacity: 1, pointerEvents: 'auto' } : {}
      }}
    >
      <CanvasBlockEditProvider block={block} updateProps={changes => updateBlock(block.id, changes)}>
        <BlockEditHost
          block={block}
          nested={nested}
          preferToolbarBelow={preferToolbarBelow}
          onSelect={selectThisBlock}
          onDelete={() => deleteBlock(block.id)}
          dragHandleProps={{ ...attributes, ...listeners }}
          isSelected={isSelected}
          isEditMode={isEditMode}
        />
      </CanvasBlockEditProvider>
      {isEditMode && !isSelected && (
        <Box
          className='hover-block-toolbar'
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: BUILDER_Z_INDEX.blockToolbar,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.15s'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              ...(nested
                ? {
                    top: 8,
                    transform: 'translate(-50%, 0)'
                  }
                : preferToolbarBelow
                  ? {
                      top: 'auto',
                      bottom: -8,
                      transform: 'translate(-50%, 100%)'
                    }
                  : {
                      top: -8,
                      transform: 'translate(-50%, -100%)'
                    }),
              zIndex: BUILDER_Z_INDEX.blockToolbar,
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              px: 0.75,
              py: 0.375,
              borderRadius: 1,
              backgroundColor: 'background.paper',
              boxShadow: 1
            }}
            onClick={e => {
              e.stopPropagation()
              selectThisBlock()
            }}
          >
            <Tooltip title='Select block'>
              <IconButton size='small' sx={{ width: 24, height: 24 }}>
                <i className='ri-focus-3-line' style={{ fontSize: '0.8rem' }} />
              </IconButton>
            </Tooltip>
            <Box
              {...attributes}
              {...listeners}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 0.5,
                cursor: 'grab',
                touchAction: 'none',
                color: 'text.secondary'
              }}
            >
              <i className='ri-draggable' style={{ fontSize: '0.85rem' }} />
            </Box>
          </Box>
        </Box>
      )}
      {(insideTargets.length > 0 || (listLocation != null && blockIndex != null)) && (
        <>
          <Menu
            open={contextMenu != null}
            onClose={() => setContextMenu(null)}
            anchorReference='anchorPosition'
            anchorPosition={
              contextMenu != null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
            slotProps={{
              paper: {
                sx: { minWidth: 220, borderRadius: 1.25 }
              }
            }}
          >
            {insideTargets.map(target => (
              <MenuItem
                key={`${target.location.container}-${'column' in target.location ? target.location.column : 'slot'}-${target.label}`}
                onClick={() =>
                  openQuickAdd(target.location, target.index, `Add into ${target.label}`)
                }
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <i className='ri-login-box-line' style={{ fontSize: '1rem' }} />
                </ListItemIcon>
                <ListItemText
                  primary={`Add into ${target.label}`}
                  slotProps={{ primary: { sx: { fontSize: '0.8125rem', fontWeight: 600 } } }}
                />
              </MenuItem>
            ))}
            {listLocation != null && blockIndex != null
              ? [
                  <MenuItem
                    key='add-block-above'
                    onClick={() => openQuickAdd(listLocation, blockIndex, 'Add block above')}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <i className='ri-arrow-up-line' style={{ fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Add block above'
                      slotProps={{ primary: { sx: { fontSize: '0.8125rem', fontWeight: 600 } } }}
                    />
                  </MenuItem>,
                  <MenuItem
                    key='add-block-below'
                    onClick={() => openQuickAdd(listLocation, blockIndex + 1, 'Add block below')}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <i className='ri-arrow-down-line' style={{ fontSize: '1rem' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Add block below'
                      slotProps={{ primary: { sx: { fontSize: '0.8125rem', fontWeight: 600 } } }}
                    />
                  </MenuItem>
                ]
              : null}
          </Menu>
          <BlockQuickAddPicker
            anchorEl={quickAdd?.anchor ?? null}
            open={Boolean(quickAdd)}
            onClose={() => setQuickAdd(null)}
            location={quickAdd?.location ?? listLocation ?? { container: 'root' }}
            index={quickAdd?.index ?? blockIndex ?? 0}
            title={quickAdd?.title ?? 'Add block'}
          />
        </>
      )}
    </Box>
  )
}
