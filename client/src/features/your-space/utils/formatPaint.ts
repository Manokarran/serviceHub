import { coerceControlProps, getControlProps, isSafeColorValue, type ControlProp } from '@/lib/ai-builder/control-schema'

import type { Block, BlockPropsPatch, BlockType, SectionBlockProps } from '../types'
import type { BlockColumn } from './blockTreeUtils'
import {
  findBlockInTree,
  findBlockLocation,
  getCarouselSlideChildren,
  getSectionColumnChildren,
  getTabPanelChildren
} from './blockTreeUtils'
import { getSectionVisualPlacement } from './sectionVisualHelpers'

export type FormatPaintRegion =
  | { kind: 'section-column'; column: BlockColumn }
  | { kind: 'tab-panel'; panelId: string }
  | { kind: 'carousel-slide'; slideId: string }

export type CopiedChildFormat = {
  type: BlockType
  values: Record<string, unknown>
}

export type CopiedFormat = {
  sourceId: string
  sourceType: BlockType
  values: Record<string, unknown>
  region?: FormatPaintRegion & { childFormats: CopiedChildFormat[] }
}

export type FormatPaintMode = 'off' | 'once' | 'locked'

const TEXT_COLOR_FAMILY = ['color', 'textColor', 'iconColor', 'fillColor', 'logoIconColor'] as const
const BACKGROUND_FAMILY = ['background', 'backgroundColor'] as const
const RADIUS_FAMILY = [
  'borderRadius',
  'cardRadius',
  'iconBorderRadius',
  'tabBorderRadius',
  'contentBorderRadius',
  'mediaRadius',
  'fieldBorderRadius',
  'submitBorderRadius'
] as const

const KEY_FAMILIES: readonly (readonly string[])[] = [TEXT_COLOR_FAMILY, BACKGROUND_FAMILY, RADIUS_FAMILY]

const TYPOGRAPHY_PREFIX_PRIORITY = [
  'typography',
  'titleTypography',
  'bodyTypography',
  'logoTypography',
  'tabTypography',
  'navTypography',
  'copyrightTypography'
] as const

function isFormatProp(prop: ControlProp): boolean {
  return prop.key.includes('.') || prop.group !== 'content'
}

function isTypographyPrefix(prefix: string): boolean {
  return prefix === 'typography' || prefix.endsWith('Typography')
}

function getByPath(props: Record<string, unknown>, key: string): unknown {
  const [parent, child] = key.split('.')

  if (!child) {
    return props[parent]
  }

  const nested = props[parent]

  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return (nested as Record<string, unknown>)[child]
  }

  return undefined
}

function aliasValue(targetKey: string, source: Record<string, unknown>): unknown {
  if (targetKey in source) {
    return source[targetKey]
  }

  const family = KEY_FAMILIES.find(group => group.includes(targetKey))

  if (!family) {
    return undefined
  }

  for (const key of family) {
    if (key in source) {
      return source[key]
    }
  }

  return undefined
}

function typographyLeafValue(leaf: string, source: Record<string, unknown>): unknown {
  for (const prefix of TYPOGRAPHY_PREFIX_PRIORITY) {
    const key = `${prefix}.${leaf}`

    if (key in source) {
      return source[key]
    }
  }

  for (const [key, value] of Object.entries(source)) {
    const [parent, child] = key.split('.')

    if (child === leaf && isTypographyPrefix(parent)) {
      return value
    }
  }

  return undefined
}

export function extractFormatValues(block: Block): Record<string, unknown> {
  const props = block.props as Record<string, unknown>
  const values: Record<string, unknown> = {}

  for (const prop of getControlProps(block.type)) {
    if (!isFormatProp(prop)) {
      continue
    }

    const value = getByPath(props, prop.key)

    if (value !== undefined) {
      values[prop.key] = value
    }
  }

  return values
}

export function formatPaintRegionsEqual(a?: FormatPaintRegion | null, b?: FormatPaintRegion | null): boolean {
  if (!a || !b || a.kind !== b.kind) {
    return false
  }

  if (a.kind === 'section-column' && b.kind === 'section-column') {
    return a.column === b.column
  }

  if (a.kind === 'tab-panel' && b.kind === 'tab-panel') {
    return a.panelId === b.panelId
  }

  if (a.kind === 'carousel-slide' && b.kind === 'carousel-slide') {
    return a.slideId === b.slideId
  }

  return false
}

function copyChildFormats(children: Block[]): CopiedChildFormat[] {
  return children.map(child => ({
    type: child.type,
    values: extractFormatValues(child)
  }))
}

function getRegionChildren(block: Block, region: FormatPaintRegion): Block[] {
  if (region.kind === 'section-column') {
    return getSectionColumnChildren(block, region.column)
  }

  if (region.kind === 'tab-panel') {
    return getTabPanelChildren(block, region.panelId)
  }

  return getCarouselSlideChildren(block, region.slideId)
}

function isPanelHostType(type: Block['type']): boolean {
  return type === 'section' || type === 'tabs' || type === 'carousel'
}

export function copyBlockFormat(block: Block, region?: FormatPaintRegion | null): CopiedFormat {
  if (region && isPanelHostType(block.type)) {
    return {
      sourceId: block.id,
      sourceType: block.type,
      values: extractColumnChromeValues(block, region),
      region: {
        ...region,
        childFormats: copyChildFormats(getRegionChildren(block, region))
      }
    }
  }

  return {
    sourceId: block.id,
    sourceType: block.type,
    values: extractFormatValues(block)
  }
}

function primaryTypographyPrefix(prefixes: Set<string>): string | null {
  return TYPOGRAPHY_PREFIX_PRIORITY.find(prefix => prefixes.has(prefix)) ?? [...prefixes][0] ?? null
}

function resolveSourceValue(
  prop: ControlProp,
  source: Record<string, unknown>,
  remapTypographyPrefix: string | null
): unknown {
  if (prop.key in source) {
    return source[prop.key]
  }

  const [parent, child] = prop.key.split('.')

  if (child && isTypographyPrefix(parent) && remapTypographyPrefix === parent) {
    return typographyLeafValue(child, source)
  }

  if (!child) {
    return aliasValue(prop.key, source)
  }

  return undefined
}

export function buildFormatPaintPatch(copied: CopiedFormat, target: Block): BlockPropsPatch | null {
  if (copied.sourceId === target.id) {
    return null
  }

  const targetProps = getControlProps(target.type)
  const targetTypographyPrefixes = new Set(
    targetProps.map(prop => prop.key.split('.')[0]).filter(isTypographyPrefix)
  )
  const hasExactTypographyOverlap = Object.keys(copied.values).some(key => {
    const prefix = key.split('.')[0]

    return isTypographyPrefix(prefix) && targetTypographyPrefixes.has(prefix)
  })
  const remapTypographyPrefix = hasExactTypographyOverlap ? null : primaryTypographyPrefix(targetTypographyPrefixes)
  const patchInput: Record<string, unknown> = {}

  for (const prop of targetProps) {
    if (!isFormatProp(prop)) {
      continue
    }

    const value = resolveSourceValue(prop, copied.values, remapTypographyPrefix)

    if (value !== undefined) {
      patchInput[prop.key] = value
    }
  }

  if (Object.keys(patchInput).length === 0) {
    return null
  }

  const { props } = coerceControlProps(target.type, patchInput, target.props as Record<string, unknown>)

  if (Object.keys(props).length === 0) {
    return null
  }

  return props as BlockPropsPatch
}

export function formatPaintPatchHasChanges(target: Block, patch: BlockPropsPatch): boolean {
  const existing = target.props as Record<string, unknown>
  const next = patch as Record<string, unknown>

  return Object.entries(next).some(([key, value]) => JSON.stringify(existing[key]) !== JSON.stringify(value))
}

type ColumnChromeKeys = {
  background: 'primaryColumnBackground' | 'secondaryColumnBackground'
  animation: 'primarySplitVisualAnimation' | 'secondarySplitVisualAnimation'
  start: 'primarySplitVisualColorStart' | 'secondarySplitVisualColorStart'
  end: 'primarySplitVisualColorEnd' | 'secondarySplitVisualColorEnd'
}

function columnChromeKeys(column: BlockColumn): ColumnChromeKeys | null {
  if (column === 'primary') {
    return {
      background: 'primaryColumnBackground',
      animation: 'primarySplitVisualAnimation',
      start: 'primarySplitVisualColorStart',
      end: 'primarySplitVisualColorEnd'
    }
  }

  if (column === 'secondary') {
    return {
      background: 'secondaryColumnBackground',
      animation: 'secondarySplitVisualAnimation',
      start: 'secondarySplitVisualColorStart',
      end: 'secondarySplitVisualColorEnd'
    }
  }

  return null
}

function extractColumnChromeValues(block: Block, region: FormatPaintRegion): Record<string, unknown> {
  if (region.kind !== 'section-column' || block.type !== 'section') {
    return {}
  }

  const props = block.props as SectionBlockProps
  const keys = columnChromeKeys(region.column)
  const values: Record<string, unknown> = {}

  if (keys) {
    const background = props[keys.background]
    const animation = props[keys.animation]
    const start = props[keys.start]
    const end = props[keys.end]

    if (background) {
      values.columnBackground = background
    }

    if (animation) {
      values.splitVisualAnimation = animation
    }

    if (start) {
      values.splitVisualColorStart = start
    }

    if (end) {
      values.splitVisualColorEnd = end
    }
  }

  const placement = getSectionVisualPlacement(props)

  if (placement === region.column) {
    values.visualOnColumn = true
    values.splitVisualAnimation = props.splitVisualAnimation
    values.splitVisualColorStart = props.splitVisualColorStart
    values.splitVisualColorEnd = props.splitVisualColorEnd
  }

  return values
}

function buildColumnChromePatch(
  copied: CopiedFormat,
  target: Block,
  targetColumn: BlockColumn
): BlockPropsPatch | null {
  if (target.type !== 'section') {
    return null
  }

  const keys = columnChromeKeys(targetColumn)
  const patch: Record<string, unknown> = {}
  const background = copied.values.columnBackground

  if (keys && typeof background === 'string' && isSafeColorValue(background)) {
    patch[keys.background] = background
  }

  const animation = copied.values.splitVisualAnimation
  const start = copied.values.splitVisualColorStart
  const end = copied.values.splitVisualColorEnd

  if (keys && animation !== undefined) {
    patch[keys.animation] = animation
  }

  if (keys && typeof start === 'string' && isSafeColorValue(start)) {
    patch[keys.start] = start
  }

  if (keys && typeof end === 'string' && isSafeColorValue(end)) {
    patch[keys.end] = end
  }

  if (copied.values.visualOnColumn && (targetColumn === 'primary' || targetColumn === 'secondary')) {
    patch.splitVisualPlacement = targetColumn

    if (animation !== undefined) {
      patch.splitVisualAnimation = animation
    }

    if (typeof start === 'string' && isSafeColorValue(start)) {
      patch.splitVisualColorStart = start
    }

    if (typeof end === 'string' && isSafeColorValue(end)) {
      patch.splitVisualColorEnd = end
    }
  }

  if (Object.keys(patch).length === 0) {
    return null
  }

  return patch as BlockPropsPatch
}

function pushPatch(
  patches: Array<{ id: string; props: BlockPropsPatch }>,
  target: Block,
  patch: BlockPropsPatch | null,
  requireChanges: boolean
) {
  if (!patch) {
    return
  }

  if (requireChanges && !formatPaintPatchHasChanges(target, patch)) {
    return
  }

  patches.push({ id: target.id, props: patch })
}

function childFormatPatches(
  childFormats: CopiedChildFormat[],
  targetChildren: Block[],
  requireChanges: boolean
): Array<{ id: string; props: BlockPropsPatch }> {
  const patches: Array<{ id: string; props: BlockPropsPatch }> = []
  const count = Math.min(childFormats.length, targetChildren.length)

  for (let index = 0; index < count; index++) {
    const child = targetChildren[index]
    const source = childFormats[index]
    const patch = buildFormatPaintPatch(
      {
        sourceId: `panel-child-${index}`,
        sourceType: source.type,
        values: source.values
      },
      child
    )

    pushPatch(patches, child, patch, requireChanges)
  }

  return patches
}

function locationToRegion(location: ReturnType<typeof findBlockLocation>): { hostId: string; region: FormatPaintRegion } | null {
  if (!location) {
    return null
  }

  if (location.container === 'section' && location.column !== 'default') {
    return {
      hostId: location.sectionId,
      region: { kind: 'section-column', column: location.column }
    }
  }

  if (location.container === 'tabs') {
    return {
      hostId: location.tabsId,
      region: { kind: 'tab-panel', panelId: location.panelId }
    }
  }

  if (location.container === 'carousel') {
    return {
      hostId: location.carouselId,
      region: { kind: 'carousel-slide', slideId: location.slideId }
    }
  }

  return null
}

export function resolveFormatPaintTarget(
  blocks: Block[],
  targetId: string,
  explicitRegion?: FormatPaintRegion | null
): { block: Block; region: FormatPaintRegion | null } | null {
  const target = findBlockInTree(blocks, targetId)

  if (!target) {
    return null
  }

  if (explicitRegion) {
    return { block: target, region: explicitRegion }
  }

  const nested = locationToRegion(findBlockLocation(blocks, targetId))

  if (nested) {
    const host = findBlockInTree(blocks, nested.hostId)

    if (host) {
      return { block: host, region: nested.region }
    }
  }

  return { block: target, region: null }
}

export function collectFormatPaintPatches(
  copied: CopiedFormat,
  target: Block,
  targetRegion: FormatPaintRegion | null,
  options?: { requireChanges?: boolean }
): Array<{ id: string; props: BlockPropsPatch }> {
  const requireChanges = options?.requireChanges !== false

  if (copied.region && targetRegion) {
    if (copied.sourceId === target.id && formatPaintRegionsEqual(copied.region, targetRegion)) {
      return []
    }

    const patches: Array<{ id: string; props: BlockPropsPatch }> = []

    if (targetRegion.kind === 'section-column') {
      pushPatch(patches, target, buildColumnChromePatch(copied, target, targetRegion.column), requireChanges)
    }

    patches.push(
      ...childFormatPatches(copied.region.childFormats, getRegionChildren(target, targetRegion), requireChanges)
    )

    return patches
  }

  if (!copied.region && targetRegion) {
    return childFormatPatches(
      [{ type: copied.sourceType, values: copied.values }],
      getRegionChildren(target, targetRegion),
      requireChanges
    )
  }

  const sourceValues = copied.region
    ? (copied.region.childFormats.find(child => child.type === target.type)?.values ??
      copied.region.childFormats[0]?.values ??
      copied.values)
    : copied.values

  if (!copied.region && copied.sourceId === target.id) {
    return []
  }

  if (!sourceValues || Object.keys(sourceValues).length === 0) {
    return []
  }

  const patch = buildFormatPaintPatch(
    {
      sourceId: copied.region ? `${copied.sourceId}:child` : copied.sourceId,
      sourceType: copied.sourceType,
      values: sourceValues
    },
    target
  )
  const patches: Array<{ id: string; props: BlockPropsPatch }> = []
  pushPatch(patches, target, patch, requireChanges)

  return patches
}

export function canApplyCopiedFormat(
  copied: CopiedFormat,
  target: Block,
  targetRegion?: FormatPaintRegion | null
): boolean {
  return collectFormatPaintPatches(copied, target, targetRegion ?? null, { requireChanges: false }).length > 0
}
