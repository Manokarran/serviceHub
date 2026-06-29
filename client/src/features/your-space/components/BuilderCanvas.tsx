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
import { builderCanvasGridOverlaySx } from '../utils/builderContainerChrome'
import { getCanvasCornerRadius } from '../utils/siteStylesHelpers'
import { siteCanvasContainerSx } from '../utils/siteResponsiveHelpers'
import { SitePageTransition } from './SitePageTransition'
import { SiteStylesScope } from './SiteStylesScope'
import { SitePageBackgroundLayer } from './SitePageBackgroundLayer'
import { BuilderCanvasToolbar } from './BuilderCanvasToolbar'
import { BlockInsertDropZone } from './dnd/BlockInsertDropZone'
import { SortableBlockList } from './dnd/SortableBlockList'

type Props = {
  isMobileLayout?: boolean
}

export function BuilderCanvas({ isMobileLayout = false }: Props) {
  const theme = useTheme()
  const { blocks, mode, viewport, selectBlock, siteStyles, currentPageSlug, showGrid } = useBuilder()
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
        data-builder-canvas-scroll
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
                    overflow: isEditMode ? 'visible' : 'hidden',
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
          <SitePageTransition transitionKey={currentPageSlug}>
          <Box
            sx={{
              position: 'relative',
              minHeight: blocks.length === 0 ? '100%' : undefined,
              backgroundColor: siteStyles.colors.background,
              ...siteCanvasContainerSx()
            }}
          >
            {isEditMode && showGrid && <Box aria-hidden sx={builderCanvasGridOverlaySx(theme)} />}
            {blocks.length > 0 && <SitePageBackgroundLayer />}
            <Box sx={{ position: 'relative', zIndex: 1, ...(isEditMode && blocks.length > 0 && { pt: 5 }) }}>
          {blocks.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 420,
                gap: 2,
                p: 4,
                backgroundColor: 'transparent',
                color: siteStyles.colors.swatch4
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
                  backgroundColor: alpha(siteStyles.colors.accent, 0.08),
                  color: siteStyles.colors.accent
                }}
              >
                <i className='ri-drag-drop-line' style={{ fontSize: '1.5rem' }} />
              </Box>
              <Typography
                variant='subtitle1'
                sx={{ ...BUILDER_TYPOGRAPHY.title, color: siteStyles.colors.text }}
              >
                Start building your page
              </Typography>
              <Typography
                variant='body2'
                align='center'
                sx={{ maxWidth: 300, color: siteStyles.colors.swatch4 }}
              >
                {isMobileLayout
                  ? 'Tap Components below to add blocks, then drag to reorder on the canvas.'
                  : 'Pick a block from the left panel and drag it anywhere on the canvas, or reorder blocks using the handle.'}
              </Typography>
            </Box>
          ) : (
            <SortableBlockList blocks={blocks} location={{ container: 'root' }} />
          )}
            </Box>
          </Box>
          </SitePageTransition>
        </SiteStylesScope>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
