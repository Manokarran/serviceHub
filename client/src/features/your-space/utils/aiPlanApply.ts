import { coerceControlProps } from '@/lib/ai-builder/control-schema'
import type {
  AiBuilderInsertAt,
  AiBuilderOperation,
  AiBuilderPlan,
  AiBuilderRestyleScope,
  AiBuilderStyleChanges,
  AiBuilderTarget
} from '@/lib/ai-builder/types'
import type { TenantLocation } from '@/lib/location/types'

import { SITE_THEME_PRESETS } from '../constants/siteStylePresets'
import type { Block, BlockType, CarouselBlockProps, SectionBlockProps, TabsBlockProps } from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { createBlock } from './blockFactory'
import { asBlockProps, readBlockProps } from './blockProps'
import {
  addBlockToTree,
  canNestInCarousel,
  canNestInSection,
  canNestInTabs,
  deleteBlockFromTree,
  findBlockInTree,
  findBlockLocation,
  flattenBlocks,
  getSectionColumnChildren,
  resolvePaletteClickTarget,
  updateBlockInTree,
  type BlockLocation
} from './blockTreeUtils'
import { isDarkSurface, mergeSiteStyles } from './siteStylesHelpers'
import { reharmonizeBlockTreeToTheme } from './themePropagation'

export type AiPlanApplyInput = {
  blocks: Block[]
  siteStyles: SiteStyles
  selectedBlockId: string | null
  plan: AiBuilderPlan
  refToId: Record<string, string>
  tenantLocation?: TenantLocation | null
}

export type AiPlanApplyResult = {
  blocks: Block[]
  siteStyles: SiteStyles
  selectedBlockId: string | null

  /** One short line per applied operation, shown back to the user. */
  changes: string[]

  /** Why an operation could not be applied, so the reply can be honest about it. */
  skipped: string[]
}

/** Text color props that must react to the surface a control is dropped onto. */
const CONTRAST_PROP: Partial<Record<BlockType, string>> = {
  heading: 'color',
  text: 'color',
  showcase: 'textColor',
  pricing: 'textColor',
  icon: 'iconColor'
}

function resolveBlockId(
  target: AiBuilderTarget | undefined,
  input: { blocks: Block[]; selectedBlockId: string | null; refToId: Record<string, string> }
): string | null {
  if (!target || target === 'selected') {
    return input.selectedBlockId
  }

  if (target === 'first' || target === 'last') {
    const flat = flattenBlocks(input.blocks)
    const block = target === 'last' ? flat.at(-1) : flat[0]

    return block?.id ?? null
  }

  const mapped = input.refToId[target]

  if (mapped && findBlockInTree(input.blocks, mapped)) {
    return mapped
  }

  return findBlockInTree(input.blocks, target) ? target : null
}

function canPlaceAt(type: BlockType, location: BlockLocation): boolean {
  if (location.container === 'root') return true
  if (location.container === 'section') return canNestInSection(type)
  if (location.container === 'carousel') return canNestInCarousel(type)

  return canNestInTabs(type)
}

/** Root-level ancestor of a block, used when a control cannot legally nest where it was asked for. */
function findRootAncestorIndex(blocks: Block[], blockId: string): number {
  return blocks.findIndex(block => flattenBlocks([block]).some(entry => entry.id === blockId))
}

function containerLocation(
  container: Block,
  type: BlockType,
  edge: 'start' | 'end'
): BlockLocation | null {
  if (container.type === 'section' && canNestInSection(type)) {
    const props = container.props as SectionBlockProps
    const column = props.layout === 'default' ? 'default' : 'primary'
    const children = getSectionColumnChildren(container, column)

    return { container: 'section', sectionId: container.id, column, index: edge === 'start' ? 0 : children.length }
  }

  if (container.type === 'carousel' && canNestInCarousel(type)) {
    const slide = (container.props as CarouselBlockProps).slides[0]

    if (slide) {
      return {
        container: 'carousel',
        carouselId: container.id,
        slideId: slide.id,
        index: edge === 'start' ? 0 : (slide.children ?? []).length
      }
    }
  }

  if (container.type === 'tabs' && canNestInTabs(type)) {
    const panel = (container.props as TabsBlockProps).tabs[0]

    if (panel) {
      return {
        container: 'tabs',
        tabsId: container.id,
        panelId: panel.id,
        index: edge === 'start' ? 0 : (panel.children ?? []).length
      }
    }
  }

  return null
}

function resolveInsertLocation(
  type: BlockType,
  at: AiBuilderInsertAt | undefined,
  input: { blocks: Block[]; selectedBlockId: string | null; refToId: Record<string, string> }
): BlockLocation {
  const pageEnd: BlockLocation = { container: 'root', index: input.blocks.length }

  if (at?.position === 'page-end') {
    return pageEnd
  }

  // No explicit placement: mirror what clicking the palette would do.
  if (!at) {
    return resolvePaletteClickTarget(input.blocks, type, input.selectedBlockId)
  }

  const anchorId = resolveBlockId(at.ref ?? 'selected', input)
  const anchor = anchorId ? findBlockInTree(input.blocks, anchorId) : null

  if (!anchor || !anchorId) {
    return pageEnd
  }

  if (at.position === 'inside-start' || at.position === 'inside-end') {
    const inside = containerLocation(anchor, type, at.position === 'inside-start' ? 'start' : 'end')

    if (inside) {
      return inside
    }
  }

  const location = findBlockLocation(input.blocks, anchorId)

  if (!location) {
    return pageEnd
  }

  const sibling: BlockLocation = {
    ...location,
    index: at.position === 'before' ? location.index : location.index + 1
  }

  if (canPlaceAt(type, sibling)) {
    return sibling
  }

  // Full-width controls cannot live inside a container — place them next to its root ancestor.
  const rootIndex = findRootAncestorIndex(input.blocks, anchorId)

  return rootIndex === -1 ? pageEnd : { container: 'root', index: at.position === 'before' ? rootIndex : rootIndex + 1 }
}

/** The background a newly inserted control will actually sit on. */
function surfaceColorAt(blocks: Block[], location: BlockLocation, siteStyles: SiteStyles): string | undefined {
  if (location.container === 'root') {
    return siteStyles.colors.background
  }

  if (location.container === 'section') {
    const section = findBlockInTree(blocks, location.sectionId)
    const props = section?.props as SectionBlockProps | undefined

    const column =
      location.column === 'primary'
        ? props?.primaryColumnBackground
        : location.column === 'secondary'
          ? props?.secondaryColumnBackground
          : undefined

    return column && column !== 'transparent' ? column : props?.background
  }

  if (location.container === 'carousel') {
    return (findBlockInTree(blocks, location.carouselId)?.props as CarouselBlockProps | undefined)?.background
  }

  return (findBlockInTree(blocks, location.tabsId)?.props as TabsBlockProps | undefined)?.contentBackgroundColor
}

/** Keep inserted text legible when it lands inside a container with its own background. */
function harmonizeToSurface(
  block: Block,
  location: BlockLocation,
  blocks: Block[],
  siteStyles: SiteStyles,
  explicitKeys: string[]
): Block {
  const contrastProp = CONTRAST_PROP[block.type]

  if (!contrastProp || location.container === 'root' || explicitKeys.includes(contrastProp)) {
    return block
  }

  const dark = isDarkSurface(surfaceColorAt(blocks, location, siteStyles))

  if (dark === null) {
    return block
  }

  return {
    ...block,
    props: asBlockProps({
      ...readBlockProps(block.props),
      [contrastProp]: dark ? '#ffffff' : siteStyles.colors.text
    })
  }
}

function mergeStyleChanges(changes: AiBuilderStyleChanges, siteStyles: SiteStyles): Partial<SiteStyles> {
  return {
    ...(changes.themeId && SITE_THEME_PRESETS.some(preset => preset.id === changes.themeId)
      ? { themeId: changes.themeId }
      : {}),
    ...(changes.colors ? { colors: { ...siteStyles.colors, ...changes.colors } } : {}),
    ...(changes.fonts ? { fonts: { ...siteStyles.fonts, ...changes.fonts } } : {}),
    ...(changes.forms ? { forms: { ...siteStyles.forms, ...changes.forms } } : {}),
    ...(changes.misc ? { misc: { ...siteStyles.misc, ...changes.misc } } : {}),
    ...(changes.buttons
      ? {
          buttons: {
            primary: { ...siteStyles.buttons.primary, ...changes.buttons.primary },
            secondary: { ...siteStyles.buttons.secondary, ...changes.buttons.secondary },
            tertiary: { ...siteStyles.buttons.tertiary, ...changes.buttons.tertiary }
          }
        }
      : {})
  }
}

function propagateTheme(
  blocks: Block[],
  previous: SiteStyles,
  next: SiteStyles,
  scope: AiBuilderRestyleScope
): { blocks: Block[]; changed: number } {
  if (scope === 'none') {
    return { blocks, changed: 0 }
  }

  return reharmonizeBlockTreeToTheme(blocks, previous, next, scope === 'rebuild' ? 'force' : 'conservative')
}

function summarizeKeys(keys: string[]): string {
  return keys.length > 3 ? `${keys.slice(0, 3).join(', ')} +${keys.length - 3} more` : keys.join(', ')
}

function applyOperation(state: AiPlanApplyResult, operation: AiBuilderOperation, input: AiPlanApplyInput) {
  const refs = { blocks: state.blocks, selectedBlockId: state.selectedBlockId, refToId: input.refToId }

  switch (operation.kind) {
    case 'apply_theme': {
      const preset = SITE_THEME_PRESETS.find(entry => entry.id === operation.themeId)

      if (!preset) {
        state.skipped.push(`Unknown theme "${operation.themeId}".`)
        break
      }

      const propagated = propagateTheme(
        state.blocks,
        state.siteStyles,
        preset.styles,
        operation.restyleControls ?? 'match'
      )

      state.blocks = propagated.blocks
      state.siteStyles = preset.styles
      state.changes.push(
        propagated.changed > 0
          ? `Applied the ${preset.name} theme and restyled ${propagated.changed} control${propagated.changed === 1 ? '' : 's'}.`
          : `Applied the ${preset.name} theme.`
      )
      break
    }

    case 'update_site_styles': {
      const partial = mergeStyleChanges(operation.changes, state.siteStyles)

      if (Object.keys(partial).length === 0) {
        state.skipped.push('No recognised site style changes.')
        break
      }

      const next = mergeSiteStyles(partial, state.siteStyles)
      const propagated = propagateTheme(state.blocks, state.siteStyles, next, operation.restyleControls ?? 'none')

      state.blocks = propagated.blocks
      state.siteStyles = next
      state.changes.push(`Updated site styles (${summarizeKeys(Object.keys(partial))}).`)
      break
    }

    case 'add_block': {
      const location = resolveInsertLocation(operation.type, operation.at, refs)

      const coerced = operation.props
        ? coerceControlProps(operation.type, operation.props)
        : { props: {}, rejected: [] }

      let block: Block

      try {
        block = createBlock(operation.type, state.siteStyles, operation.paletteId, input.tenantLocation ?? null)
      } catch {
        state.skipped.push(`Could not create a ${operation.type} control.`)
        break
      }

      const explicitKeys = Object.keys(coerced.props)

      if (explicitKeys.length > 0) {
        block = { ...block, props: asBlockProps({ ...readBlockProps(block.props), ...coerced.props }) }
      }

      block = harmonizeToSurface(block, location, state.blocks, state.siteStyles, explicitKeys)

      state.blocks = addBlockToTree(state.blocks, block, location)
      state.selectedBlockId = block.id
      state.changes.push(`Added a ${operation.type} control.`)

      if (coerced.rejected.length > 0) {
        state.skipped.push(`Ignored unsupported ${operation.type} settings: ${summarizeKeys(coerced.rejected)}.`)
      }

      break
    }

    case 'update_block': {
      const blockId = resolveBlockId(operation.target, refs)
      const block = blockId ? findBlockInTree(state.blocks, blockId) : null

      if (!block || !blockId) {
        state.skipped.push('Could not find the control to change. Select it in the preview and try again.')
        break
      }

      const coerced = coerceControlProps(block.type, operation.props, readBlockProps(block.props))
      const keys = Object.keys(coerced.props)

      if (keys.length === 0) {
        state.skipped.push(
          `A ${block.type} control has no ${summarizeKeys(coerced.rejected)} setting, so nothing changed.`
        )
        break
      }

      state.blocks = updateBlockInTree(state.blocks, blockId, coerced.props)
      state.changes.push(`Changed ${summarizeKeys(keys)} on the ${block.type} control.`)

      if (coerced.rejected.length > 0) {
        state.skipped.push(`Ignored unsupported ${block.type} settings: ${summarizeKeys(coerced.rejected)}.`)
      }

      break
    }

    case 'delete_block': {
      const blockId = resolveBlockId(operation.target, refs)
      const block = blockId ? findBlockInTree(state.blocks, blockId) : null

      if (!block || !blockId) {
        state.skipped.push('Could not find the control to remove.')
        break
      }

      state.blocks = deleteBlockFromTree(state.blocks, blockId)
      state.selectedBlockId = state.selectedBlockId === blockId ? null : state.selectedBlockId
      state.changes.push(`Removed the ${block.type} control.`)
      break
    }

    default: {
      const exhaustive: never = operation

      return exhaustive
    }
  }
}

/**
 * Run a whole plan against one snapshot of builder state. Applying operations
 * together — rather than dispatching them one at a time — lets later operations
 * see the controls added by earlier ones.
 */
export function applyAiBuilderPlan(input: AiPlanApplyInput): AiPlanApplyResult {
  const state: AiPlanApplyResult = {
    blocks: input.blocks,
    siteStyles: input.siteStyles,
    selectedBlockId: input.selectedBlockId,
    changes: [],
    skipped: []
  }

  for (const operation of input.plan.operations) {
    applyOperation(state, operation, input)
  }

  return state
}
