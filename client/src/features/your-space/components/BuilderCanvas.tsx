'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { VIEWPORT_WIDTHS, BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import {
  builderCanvasFrameInnerSx,
  builderCanvasFrameOuterSx,
  builderCanvasWorkspaceSx
} from '../constants/builderChrome'
import { useBuilder } from '../context/BuilderContext'
import { insertDropId } from '../utils/blockTreeUtils'
import { getCanvasCornerRadius } from '../utils/siteStylesHelpers'
import { SiteStylesScope } from './SiteStylesScope'
import { BuilderCanvasToolbar } from './BuilderCanvasToolbar'
import { BlockInsertDropZone } from './dnd/BlockInsertDropZone'
import { SortableBlockList } from './dnd/SortableBlockList'

type Props = {
  isMobileLayout?: boolean
}

export function BuilderCanvas({ isMobileLayout = false }: Props) {
  const theme = useTheme()
  const { blocks, mode, viewport, selectBlock, siteStyles } = useBuilder()
  const isEditMode = mode === 'edit'
  const { active } = useDndContext()
  const isDragging = Boolean(active)

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone', disabled: blocks.length > 0 })

  const viewportWidth = VIEWPORT_WIDTHS[viewport]
  const showDeviceFrame = viewport !== 'desktop' || !isEditMode

  const frameRadius = getCanvasCornerRadius(siteStyles.misc)
  const useGradientFrame = isEditMode || showDeviceFrame

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0
      }}
      onClick={() => isEditMode && selectBlock(null)}
    >
      <BuilderCanvasToolbar />

      <Box
        ref={setNodeRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: isEditMode ? { xs: 1.5, sm: 3 } : 0,
          pb: isEditMode && isMobileLayout ? { xs: 10, sm: 3 } : isEditMode ? 3 : 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          ...(isEditMode ? builderCanvasWorkspaceSx(theme) : { backgroundColor: alpha(theme.palette.text.primary, 0.03) })
        }}
      >
        <Box
          sx={{
            width: viewportWidth ? `${viewportWidth}px` : '100%',
            maxWidth: isEditMode ? (viewportWidth ? `${viewportWidth}px` : 1080) : '100%',
            minHeight: isEditMode ? '100%' : 'auto',
            ...(useGradientFrame
              ? {
                  ...builderCanvasFrameOuterSx(theme, frameRadius),
                  ...(isOver &&
                    blocks.length === 0 && {
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.45)} 0%, ${alpha(theme.palette.primary.light, 0.25)} 50%, ${alpha(theme.palette.primary.main, 0.35)} 100%)`,
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}, 0 12px 40px ${alpha(theme.palette.primary.main, 0.12)}`
                  }),
                  ...(isDragging &&
                    blocks.length > 0 && {
                    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.12)}`
                  }),
                  transition: 'box-shadow 0.2s, background 0.2s'
                }
              : {
                  backgroundColor: 'background.paper',
                  borderRadius: 0,
                  overflow: 'hidden'
                })
          }}
        >
          <Box
            sx={
              useGradientFrame
                ? {
                    ...builderCanvasFrameInnerSx(theme, frameRadius),
                    ...(viewport === 'mobile' &&
                      showDeviceFrame && {
                        '&::before': {
                          content: '""',
                          display: 'block',
                          height: 24,
                          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 100%)`,
                          boxShadow: `inset 0 -1px 0 ${alpha(theme.palette.primary.main, 0.1)}`
                        }
                      })
                  }
                : { width: '100%' }
            }
          >
        <SiteStylesScope siteStyles={siteStyles}>
          {blocks.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 420,
                gap: 2,
                color: 'text.secondary',
                p: 4
              }}
            >
              <BlockInsertDropZone id={insertDropId({ container: 'root', index: 0 })} />
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main'
                }}
              >
                <i className='ri-drag-drop-line' style={{ fontSize: '1.5rem' }} />
              </Box>
              <Typography variant='subtitle1' color='text.primary' sx={BUILDER_TYPOGRAPHY.title}>
                Start building your page
              </Typography>
              <Typography variant='body2' align='center' sx={{ maxWidth: 300, color: 'text.secondary' }}>
                {isMobileLayout
                  ? 'Tap Components below to add blocks, then drag to reorder on the canvas.'
                  : 'Pick a block from the left panel and drag it anywhere on the canvas, or reorder blocks using the handle.'}
              </Typography>
            </Box>
          ) : (
            <SortableBlockList blocks={blocks} location={{ container: 'root' }} />
          )}
        </SiteStylesScope>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
