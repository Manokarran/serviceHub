'use client'

import Box from '@mui/material/Box'

import {
  getSectionColumnEmptyLabel,
  getSectionColumnWeights,
  getSectionColumnsForLayout,
  isSplitSectionLayout
} from '../../constants/sectionLayout'
import type { Block, SectionBlockProps } from '../../types'
import { getSectionColumnChildren, type BlockColumn } from '../../utils/blockTreeUtils'
import {
  getBlockBackgroundShellSx,
  getPhotoAnimation,
  getBlockFillOpacity,
  getSectionColumnShellSx,
  getSectionDividerSx,
  getSectionFrameSx,
  getSectionSplitContainerSx,
  isPhotoBackground,
  isVideoBackground,
  shouldRenderBlockBackgroundLayers,
  shouldShowSplitDivider
} from '../../utils/sectionStyleHelpers'
import {
  getSectionSplitVisualConfig,
  shouldRenderSectionBackgroundVisual,
  shouldRenderSectionColumnVisual
} from '../../utils/sectionVisualHelpers'
import { resolveHeroVisualColors } from '../../utils/heroVisualHelpers'
import { useSiteStyles } from '../SiteStylesScope'
import { SectionDropZone } from '../dnd/SectionDropZone'
import { SectionEditChip } from '../inline/SectionEditChip'
import { BlockBackgroundLayers } from './BlockBackgroundLayers'
import { BlockRenderer } from './BlockRenderer'
import { HeroVisualPanel } from './HeroVisualPanel'
import { siteCanvasBelow } from '../../utils/siteResponsiveHelpers'

const MAX_WIDTH_MAP = {
  sm: 640,
  md: 768,
  lg: 1024,
  full: '100%'
} as const

type SectionContentProps = {
  block: Block
  props: SectionBlockProps
  editMode: boolean
}

function SectionColumn({
  block,
  props,
  editMode,
  column,
  emptyLabel
}: SectionContentProps & {
  column: Exclude<BlockColumn, 'default'>
  emptyLabel: string
}) {
  const siteStyles = useSiteStyles()
  const children = getSectionColumnChildren(block, column)
  const showVisual =
    (column === 'primary' || column === 'secondary') && shouldRenderSectionColumnVisual(props, column)
  const columnConfig = getSectionSplitVisualConfig(props)
  const visualColors = resolveHeroVisualColors(columnConfig, siteStyles.colors.accent)

  const content = editMode ? (
    <SectionDropZone
      sectionId={block.id}
      column={column}
      children={children}
      sectionProps={props}
      editMode
      emptyLabel={emptyLabel}
    />
  ) : (
    children.map(child => <BlockRenderer key={child.id} block={child} preview />)
  )

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        height: '100%',
        ...(editMode && children.length === 0
          ? { minHeight: props.layout === 'split-vertical' ? 100 : showVisual ? 200 : 120 }
          : showVisual && children.length === 0
            ? { minHeight: 200 }
            : {})
      }}
    >
      {showVisual && (
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <HeroVisualPanel
            animation={columnConfig.splitVisualAnimation}
            colorStart={visualColors.start}
            colorEnd={visualColors.end}
            mode='section-column'
          />
        </Box>
      )}
      <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {content}
      </Box>
    </Box>
  )
}

function SectionColumns({ block, props, editMode }: SectionContentProps) {
  const showDivider = shouldShowSplitDivider(props)
  const columns = getSectionColumnsForLayout(props.layout)
  const weights = getSectionColumnWeights(props.layout, props.splitRatio ?? 50)

  return (
    <Box sx={getSectionSplitContainerSx(props, props.layout)}>
      {columns.flatMap((column, index) => {
        const shell = (
          <Box key={column} sx={getSectionColumnShellSx(props, column, editMode, weights[index] ?? 1)}>
            <SectionColumn
              block={block}
              props={props}
              editMode={editMode}
              column={column}
              emptyLabel={getSectionColumnEmptyLabel(props.layout, column)}
            />
          </Box>
        )

        if (!showDivider || index === 0) {
          return [shell]
        }

        return [
          <Box key={`divider-${column}`} sx={getSectionDividerSx(props, props.layout)} aria-hidden />,
          shell
        ]
      })}
    </Box>
  )
}

function SectionInner({ block, props, editMode }: SectionContentProps) {
  if (isSplitSectionLayout(props.layout)) {
    return <SectionColumns block={block} props={props} editMode={editMode} />
  }

  if (editMode) {
    return (
      <SectionDropZone
        sectionId={block.id}
        column='default'
        children={props.children ?? []}
        sectionProps={props}
        editMode
        emptyLabel={getSectionColumnEmptyLabel(props.layout, 'default')}
      />
    )
  }

  return (props.children ?? []).map(child => <BlockRenderer key={child.id} block={child} preview />)
}

function SectionShell({ block, preview }: Props) {
  const siteStyles = useSiteStyles()
  const props = block.props as SectionBlockProps
  const maxWidth = MAX_WIDTH_MAP[props.maxWidth]
  const editMode = !preview
  const hasPhoto = isPhotoBackground(props)
  const hasVideo = isVideoBackground(props)
  const hasMedia = hasPhoto || hasVideo
  const fillOpacity = getBlockFillOpacity(props)
  const photoAnimation = hasMedia ? getPhotoAnimation(props, siteStyles.misc.imageHoverEffect) : 'none'
  const showStaticBackgroundLayers = shouldRenderBlockBackgroundLayers(props)
  const showBackgroundVisual = shouldRenderSectionBackgroundVisual(props)
  const visualColors = resolveHeroVisualColors(props, siteStyles.colors.accent)

  return (
    <Box
      component='section'
      sx={{
        position: 'relative',
        ...getBlockBackgroundShellSx(props, photoAnimation, fillOpacity, '#ffffff', {
          fillEnabled: showStaticBackgroundLayers
        }),
        overflow: editMode ? 'visible' : undefined,
        py: `${props.paddingY}px`,
        px: `${props.paddingX}px`,
        ...siteCanvasBelow({
          ...(props.paddingX > 24 ? { px: `${Math.min(props.paddingX, 24)}px` } : {})
        })
      }}
    >
      {showBackgroundVisual && (
        <HeroVisualPanel
          animation={props.splitVisualAnimation}
          colorStart={visualColors.start}
          colorEnd={visualColors.end}
          mode='section-background'
        />
      )}
      {editMode && <SectionEditChip sectionId={block.id} />}
      {showStaticBackgroundLayers && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}
        >
          <BlockBackgroundLayers props={props} photoOpacity={fillOpacity} />
        </Box>
      )}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'transparent',
          maxWidth: typeof maxWidth === 'number' ? maxWidth : maxWidth,
          mx: props.maxWidth === 'full' ? 0 : 'auto',
          ...getSectionFrameSx(props),
          ...(editMode ? { overflow: 'visible' } : {}),
          ...((props.borderStyle === 'elevated' || props.borderStyle === 'inset') && { p: 1.5 })
        }}
      >
        <SectionInner block={block} props={props} editMode={editMode} />
      </Box>
    </Box>
  )
}

type Props = {
  block: Block
  preview?: boolean
}

export function SectionBlock({ block, preview = false }: Props) {
  return <SectionShell block={block} preview={preview} />
}

export function SectionBlockPreview({ block }: { block: Block }) {
  return <SectionShell block={block} preview />
}
