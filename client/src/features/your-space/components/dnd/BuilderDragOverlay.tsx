'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { getImageKitThumbnailUrl } from '@/lib/imagekit/urls'
import { getPaletteItem } from '../../constants'
import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import type { ActiveDragItem, Block, ImageBlockProps, LogoBlockProps } from '../../types'
import { findBlockInTree } from '../../utils/blockTreeUtils'
import { BlockThumbnail } from './BlockThumbnail'

const DRAG_IMAGE_MAX_WIDTH = 200
const DRAG_IMAGE_MAX_HEIGHT = 140

type Props = {
  activeDrag: ActiveDragItem | null
  blocks: Block[]
}

function DragImagePreview({ src, alt, maxHeight }: { src: string; alt: string; maxHeight?: number }) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        maxWidth: DRAG_IMAGE_MAX_WIDTH,
        maxHeight: DRAG_IMAGE_MAX_HEIGHT,
        borderRadius: '1px',
        overflow: 'hidden',
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.18)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
        backgroundColor: 'background.paper',
        cursor: 'grabbing'
      }}
    >
      <Box
        component='img'
        src={getImageKitThumbnailUrl(src, DRAG_IMAGE_MAX_WIDTH)}
        alt={alt}
        sx={{
          display: 'block',
          width: 'auto',
          height: 'auto',
          maxWidth: DRAG_IMAGE_MAX_WIDTH,
          maxHeight: maxHeight ?? DRAG_IMAGE_MAX_HEIGHT,
          objectFit: 'scale-down'
        }}
      />
    </Box>
  )
}

function DragLabelChip({ label }: { label: string }) {
  return (
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
        {label}
      </Typography>
    </Box>
  )
}

export function BuilderDragOverlay({ activeDrag, blocks }: Props) {
  if (!activeDrag) {
    return null
  }

  if (activeDrag.source === 'canvas' && activeDrag.blockId) {
    const block = findBlockInTree(blocks, activeDrag.blockId)

    if (block?.type === 'image') {
      const props = block.props as ImageBlockProps

      if (props.src) {
        return <DragImagePreview src={props.src} alt={props.alt || 'Image'} />
      }
    }

    if (block?.type === 'logo') {
      const props = block.props as LogoBlockProps

      if (props.src) {
        return <DragImagePreview src={props.src} alt={props.alt || 'Logo'} maxHeight={64} />
      }
    }
  }

  if (activeDrag.source === 'palette') {
    const paletteItem = getPaletteItem(activeDrag.paletteId, activeDrag.type)

    if (activeDrag.type === 'image' || activeDrag.paletteId === 'image') {
      return (
        <Box
          sx={{
            width: 160,
            borderRadius: 1,
            overflow: 'hidden',
            boxShadow: 4,
            cursor: 'grabbing',
            backgroundColor: 'background.paper'
          }}
        >
          <BlockThumbnail itemId='image' itemType='image' itemIcon='ri-image-2-line' />
          <Typography
            variant='caption'
            sx={{
              ...BUILDER_TYPOGRAPHY.label,
              display: 'block',
              textAlign: 'center',
              py: 0.75,
              px: 1
            }}
          >
            {paletteItem?.label ?? 'Image'}
          </Typography>
        </Box>
      )
    }
  }

  const label =
    getPaletteItem(activeDrag.paletteId, activeDrag.type)?.label ??
    (activeDrag.blockId ? 'Moving block' : activeDrag.type)

  return <DragLabelChip label={label} />
}
