'use client'

import Box from '@mui/material/Box'

import type { Block, SectionBlockProps } from '../../types'
import { getSectionColumnChildren } from '../../utils/blockTreeUtils'
import {
  getBlockBackgroundShellSx,
  getPhotoAnimation,
  getPhotoOpacity,
  getSectionColumnShellSx,
  getSectionDividerSx,
  getSectionFrameSx,
  getSectionSplitContainerSx,
  isPhotoBackground,
  isVideoBackground,
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
  column: 'primary' | 'secondary'
  emptyLabel: string
}) {
  const siteStyles = useSiteStyles()
  const children = getSectionColumnChildren(block, column)
  const showVisual = shouldRenderSectionColumnVisual(props)
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
        minHeight: showVisual && children.length === 0 ? 200 : undefined
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
  const isHorizontal = props.layout === 'split-horizontal'
  const primaryLabel = isHorizontal ? 'Drop blocks in the left column' : 'Drop blocks in the top row'
  const secondaryLabel = isHorizontal ? 'Drop blocks in the right column' : 'Drop blocks in the bottom row'

  return (
    <Box sx={getSectionSplitContainerSx(props, props.layout)}>
      <Box sx={getSectionColumnShellSx(props, 'primary', editMode)}>
        <SectionColumn
          block={block}
          props={props}
          editMode={editMode}
          column='primary'
          emptyLabel={primaryLabel}
        />
      </Box>
      {showDivider && <Box sx={getSectionDividerSx(props, props.layout)} aria-hidden />}
      <Box sx={getSectionColumnShellSx(props, 'secondary', editMode)}>
        <SectionColumn
          block={block}
          props={props}
          editMode={editMode}
          column='secondary'
          emptyLabel={secondaryLabel}
        />
      </Box>
    </Box>
  )
}

function SectionInner({ block, props, editMode }: SectionContentProps) {
  const isSplit = props.layout === 'split-horizontal' || props.layout === 'split-vertical'

  if (isSplit) {
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
        emptyLabel='Drop heading, text, button, image, video, logo, carousel, tabs, or shape blocks here'
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
  const photoOpacity = getPhotoOpacity(props)
  const photoAnimation = hasMedia ? getPhotoAnimation(props, siteStyles.misc.imageHoverEffect) : 'none'
  const showBackgroundVisual = shouldRenderSectionBackgroundVisual(props)
  const visualColors = resolveHeroVisualColors(props, siteStyles.colors.accent)

  return (
    <Box
      component='section'
      sx={{
        position: 'relative',
        ...getBlockBackgroundShellSx(props, photoAnimation, photoOpacity),
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
      <BlockBackgroundLayers props={props} photoOpacity={photoOpacity} />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: typeof maxWidth === 'number' ? maxWidth : maxWidth,
          mx: props.maxWidth === 'full' ? 0 : 'auto',
          ...getSectionFrameSx(props),
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
