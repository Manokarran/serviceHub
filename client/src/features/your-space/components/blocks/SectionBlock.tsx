'use client'

import Box from '@mui/material/Box'

import type { Block, SectionBlockProps } from '../../types'
import { useSiteStyles } from '../SiteStylesScope'
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
import { SectionDropZone } from '../dnd/SectionDropZone'
import { BlockBackgroundLayers } from './BlockBackgroundLayers'
import { BlockRenderer } from './BlockRenderer'

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

function SectionColumns({
  block,
  props,
  editMode,
  renderColumn
}: SectionContentProps & {
  renderColumn: (column: 'primary' | 'secondary', label: string) => React.ReactNode
}) {
  const showDivider = shouldShowSplitDivider(props)

  return (
    <Box sx={getSectionSplitContainerSx(props, props.layout)}>
      <Box sx={getSectionColumnShellSx(props, 'primary', editMode)}>{renderColumn('primary', 'Drop blocks in the primary column')}</Box>
      {showDivider && <Box sx={getSectionDividerSx(props, props.layout)} aria-hidden />}
      <Box sx={getSectionColumnShellSx(props, 'secondary', editMode)}>
        {renderColumn('secondary', 'Drop blocks in the secondary column')}
      </Box>
    </Box>
  )
}

function SectionInner({ block, props, editMode }: SectionContentProps) {
  const isSplit = props.layout === 'split-horizontal' || props.layout === 'split-vertical'

  if (isSplit) {
    return (
      <SectionColumns
        block={block}
        props={props}
        editMode={editMode}
        renderColumn={(column, label) =>
          editMode ? (
            <SectionDropZone
              sectionId={block.id}
              column={column}
              children={getSectionColumnChildren(block, column)}
              sectionProps={props}
              editMode
              emptyLabel={label}
            />
          ) : (
            getSectionColumnChildren(block, column).map(child => <BlockRenderer key={child.id} block={child} preview />)
          )
        }
      />
    )
  }

  if (editMode) {
    return (
      <SectionDropZone
        sectionId={block.id}
        column='default'
        children={props.children ?? []}
        sectionProps={props}
        editMode
        emptyLabel='Drop heading, text, button, image, video, or logo blocks here'
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

  return (
    <Box
      component='section'
      sx={{
        ...getBlockBackgroundShellSx(props, photoAnimation, photoOpacity),
        py: `${props.paddingY}px`,
        px: `${props.paddingX}px`
      }}
    >
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
