'use client'

import { useState, type MouseEvent } from 'react'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { Block } from '../../types'
import { builderContainerChromeSx } from '../../utils/builderContainerChrome'
import { insertDropId, carouselDropId } from '../../utils/blockTreeUtils'
import { formatPaintRegionsEqual } from '../../utils/formatPaint'
import { useBuilderOptional } from '../../context/BuilderContext'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { BlockInsertDropZone } from './BlockInsertDropZone'
import { BlockQuickAddPicker } from './BlockQuickAddPicker'
import { DropTargetCue } from './DropTargetCue'
import { SortableBlockList } from './SortableBlockList'

type Props = {
  carouselId: string
  slideId: string
  slideLabel: string
  children: Block[]
  editMode: boolean
  emptyLabel: string
}

export function CarouselDropZone({
  carouselId,
  slideId,
  slideLabel,
  children,
  editMode,
  emptyLabel
}: Props) {
  const theme = useTheme()
  const { active } = useDndContext()
  const builder = useBuilderOptional()
  const selectBlock = builder?.selectBlock
  const selectedBlockId = builder?.selectedBlockId
  const selectedRegion = builder?.selectedRegion
  const formatPaintMode = builder?.formatPaintMode ?? 'off'
  const copiedFormat = builder?.copiedFormat
  const isDragging = Boolean(active)
  const { setNodeRef, isOver } = useDroppable({
    id: carouselDropId(carouselId, slideId),
    data: { container: 'carousel', carouselId, slideId }
  })
  const location = { container: 'carousel' as const, carouselId, slideId }
  const isEmpty = children.length === 0
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null)
  const slideRegion = { kind: 'carousel-slide' as const, slideId }
  const isSlideSelected =
    selectedBlockId === carouselId && Boolean(selectedRegion && formatPaintRegionsEqual(slideRegion, selectedRegion))
  const isFormatPaintTarget =
    formatPaintMode !== 'off' &&
    Boolean(copiedFormat?.region) &&
    !formatPaintRegionsEqual(copiedFormat?.region, slideRegion)

  if (!editMode) {
    return (
      <>
        {children.map(child => (
          <BlockRenderer key={child.id} block={child} preview />
        ))}
      </>
    )
  }

  return (
    <Box
      ref={setNodeRef}
      onClick={e => {
        if (!editMode) {
          return
        }

        const nestedId = (e.target as HTMLElement | null)
          ?.closest?.('[data-builder-block-id]')
          ?.getAttribute('data-builder-block-id')

        if (nestedId && nestedId !== carouselId) {
          return
        }

        e.stopPropagation()
        selectBlock?.(carouselId, { region: { kind: 'carousel-slide', slideId } })
      }}
      sx={{
        width: '100%',
        minHeight: isEmpty ? 140 : 56,
        height: isEmpty ? '100%' : undefined,
        flex: isEmpty ? 1 : undefined,
        borderRadius: 1,
        transition: 'box-shadow 0.15s ease, background-color 0.15s ease',
        ...(isDragging
          ? builderContainerChromeSx(theme, { isOver, isDragging })
          : {
              backgroundColor: 'transparent',
              border: '1px solid transparent'
            }),
        ...(isDragging && isOver
          ? {
              backgroundColor: alpha(theme.palette.primary.main, 0.08)
            }
          : {}),
        p: isEmpty ? 2 : 0.25,
        cursor: isFormatPaintTarget ? 'copy' : undefined,
        outline: isSlideSelected ? '2px solid' : isFormatPaintTarget ? '2px dashed' : '2px solid transparent',
        outlineColor: isSlideSelected || isFormatPaintTarget ? 'primary.main' : 'transparent',
        outlineOffset: -2
      }}
    >
      {isDragging && isOver && <DropTargetCue label={`Drop in ${slideLabel}`} emphasized />}
      {isEmpty ? (
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.25,
            flex: 1,
            minHeight: 112,
            color: isOver ? 'primary.main' : 'text.disabled',
            textAlign: 'center',
            px: 2
          }}
        >
          <BlockInsertDropZone
            id={insertDropId({ ...location, index: 0 })}
            location={location}
            index={0}
            fill={isDragging}
          />
          <Typography
            sx={{
              fontSize: '0.75rem',
              lineHeight: 1.5,
              position: 'relative',
              zIndex: 0,
              fontWeight: isOver ? 700 : 400
            }}
          >
            {isDragging
              ? isOver
                ? `Release to place in ${slideLabel}`
                : slideLabel
              : emptyLabel}
          </Typography>
          {!isDragging && (
            <>
              <Box
                component='button'
                type='button'
                onClick={(e: MouseEvent<HTMLElement>) => {
                  e.stopPropagation()
                  setPickerAnchor(e.currentTarget)
                }}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.625,
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.14)
                  }
                }}
              >
                <i className='ri-add-line' style={{ fontSize: '0.9rem' }} />
                Add block into {slideLabel}
              </Box>
              <BlockQuickAddPicker
                anchorEl={pickerAnchor}
                open={Boolean(pickerAnchor)}
                onClose={() => setPickerAnchor(null)}
                location={location}
                index={0}
                title={`Add into ${slideLabel}`}
              />
            </>
          )}
        </Box>
      ) : (
        <SortableBlockList blocks={children} location={location} nested />
      )}
    </Box>
  )
}
