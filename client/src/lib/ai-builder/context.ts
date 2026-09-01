import type {
  Block,
  BlockType,
  CarouselBlockProps,
  SectionBlockProps,
  TabsBlockProps
} from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { readBlockProps } from '@/features/your-space/utils/blockProps'

import { getControlProps } from './control-schema'
import type {
  AiBuilderContext,
  AiBuilderContextBundle,
  AiBuilderOutlineNode,
  AiBuilderThemeSummary
} from './types'

const MAX_OUTLINE_NODES = 60
const MAX_OUTLINE_DEPTH = 3
const MAX_LABEL_LENGTH = 44

const LABEL_KEYS = ['title', 'text', 'logoText', 'copyrightText', 'eyebrow', 'alt', 'iconName', 'address', 'ctaLabel']

function readLabel(props: Record<string, unknown>): string | undefined {
  for (const key of LABEL_KEYS) {
    const value = props[key]

    if (typeof value === 'string' && value.trim().length > 0) {
      const trimmed = value.trim().replace(/\s+/g, ' ')

      return trimmed.length > MAX_LABEL_LENGTH ? `${trimmed.slice(0, MAX_LABEL_LENGTH)}…` : trimmed
    }
  }

  return undefined
}

function readBackground(props: Record<string, unknown>): string | undefined {
  const value = props.background ?? props.backgroundColor

  if (typeof value !== 'string' || value.trim().length === 0 || value === 'transparent') {
    return undefined
  }

  return value.length > 60 ? `${value.slice(0, 60)}…` : value
}

function childGroups(block: Block): Block[] {
  if (block.type === 'section') {
    const props = block.props as SectionBlockProps

    return [...(props.children ?? []), ...(props.primaryChildren ?? []), ...(props.secondaryChildren ?? [])]
  }

  if (block.type === 'carousel') {
    return (block.props as CarouselBlockProps).slides.flatMap(slide => slide.children ?? [])
  }

  if (block.type === 'tabs') {
    return (block.props as TabsBlockProps).tabs.flatMap(panel => panel.children ?? [])
  }

  return []
}

/**
 * Walk the tree in the order controls appear on the page, assigning short refs.
 * Visual order matters: "the control under the hero" is meaningless against the
 * flattened-by-container ordering used elsewhere.
 */
function walkOutline(
  blocks: Block[],
  depth: number,
  parentRef: string | undefined,
  state: { nodes: AiBuilderOutlineNode[]; refToId: Record<string, string>; idToRef: Record<string, string> }
) {
  for (const block of blocks) {
    if (state.nodes.length >= MAX_OUTLINE_NODES) {
      return
    }

    const ref = `c${state.nodes.length + 1}`
    const props = readBlockProps(block.props)

    state.refToId[ref] = block.id
    state.idToRef[block.id] = ref
    state.nodes.push({
      ref,
      type: block.type,
      depth,
      ...(parentRef ? { parentRef } : {}),
      ...(readLabel(props) ? { label: readLabel(props) } : {}),
      ...(readBackground(props) ? { background: readBackground(props) } : {})
    })

    if (depth < MAX_OUTLINE_DEPTH) {
      walkOutline(childGroups(block), depth + 1, ref, state)
    }
  }
}

/** Schema-known props that are actually set, so the model sees current values without the nested tree. */
function selectedProps(block: Block): Record<string, unknown> {
  const props = readBlockProps(block.props)
  const result: Record<string, unknown> = {}

  for (const prop of getControlProps(block.type)) {
    const [parent, child] = prop.key.split('.')

    if (child) {
      const nested = props[parent]

      if (nested && typeof nested === 'object' && (nested as Record<string, unknown>)[child] !== undefined) {
        result[prop.key] = (nested as Record<string, unknown>)[child]
      }

      continue
    }

    if (props[parent] !== undefined) {
      result[parent] = props[parent]
    }
  }

  return result
}

function summarizeTheme(siteStyles: SiteStyles): AiBuilderThemeSummary {
  const { colors, fonts, misc, buttons } = siteStyles

  return {
    id: siteStyles.themeId,
    accent: colors.accent,
    background: colors.background,
    text: colors.text,
    swatches: [colors.swatch1, colors.swatch2, colors.swatch3, colors.swatch4, colors.swatch5],
    headingFamily: fonts.headingFamily,
    bodyFamily: fonts.bodyFamily,
    headingSize: fonts.headingSize,
    bodySize: fonts.bodySize,
    buttonShape: buttons.primary.shape,
    spacing: misc.spacingScale
  }
}

export function buildAiBuilderContext(input: {
  pageSlug: string
  blocks: Block[]
  siteStyles: SiteStyles
  selectedBlock: Block | null
}): AiBuilderContextBundle {
  const state = { nodes: [] as AiBuilderOutlineNode[], refToId: {} as Record<string, string>, idToRef: {} as Record<string, string> }

  walkOutline(input.blocks, 0, undefined, state)

  const selectedRef = input.selectedBlock ? state.idToRef[input.selectedBlock.id] : undefined

  const context: AiBuilderContext = {
    page: input.pageSlug,
    theme: summarizeTheme(input.siteStyles),
    outline: state.nodes,
    selected:
      input.selectedBlock && selectedRef
        ? { ref: selectedRef, type: input.selectedBlock.type, props: selectedProps(input.selectedBlock) }
        : null
  }

  return { context, refToId: state.refToId }
}

/** Control types the model may need capabilities for: what is selected, its neighbours, and its parent. */
export function relevantControlTypes(context: AiBuilderContext): BlockType[] {
  const types: BlockType[] = []

  if (context.selected) {
    types.push(context.selected.type)

    const index = context.outline.findIndex(node => node.ref === context.selected?.ref)
    const selectedNode = context.outline[index]

    for (const node of [context.outline[index - 1], context.outline[index + 1]]) {
      if (node) {
        types.push(node.type)
      }
    }

    if (selectedNode?.parentRef) {
      const parent = context.outline.find(node => node.ref === selectedNode.parentRef)

      if (parent) {
        types.push(parent.type)
      }
    }
  }

  return Array.from(new Set(types))
}

/** Compact line-per-control rendering — roughly a third of the tokens of the JSON equivalent. */
export function describePageOutline(outline: AiBuilderOutlineNode[]): string {
  return outline
    .map(node => {
      const indent = '  '.repeat(node.depth)
      const label = node.label ? ` "${node.label}"` : ''
      const background = node.background ? ` bg=${node.background}` : ''

      return `${indent}${node.ref} ${node.type}${label}${background}`
    })
    .join('\n')
}
