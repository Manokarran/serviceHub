import { DEFAULT_SHOWCASE_ITEMS, SHOWCASE_MAX_ITEMS } from '../constants/showcaseLayout'
import { DEFAULT_HERO_SPLIT_VISUAL_ANIMATION } from '../constants/heroVisual'
import type { ShowcaseBlockProps, ShowcaseItem, ShowcaseVisualKind } from '../types'

export const SHOWCASE_MAX_WIDTH_MAP = {
  sm: 640,
  md: 768,
  lg: 1120,
  full: '100%'
} as const

export function createShowcaseItem(id: string, index = 0, overrides: Partial<ShowcaseItem> = {}): ShowcaseItem {
  const template = DEFAULT_SHOWCASE_ITEMS[index % DEFAULT_SHOWCASE_ITEMS.length]

  return {
    ...template,
    imageHoverEffect: template.imageHoverEffect ?? 'zoom',
    splitVisualAnimation: template.splitVisualAnimation || DEFAULT_HERO_SPLIT_VISUAL_ANIMATION,
    ...overrides,
    id
  }
}

export function cloneShowcaseItems(items: ShowcaseItem[], createId: () => string): ShowcaseItem[] {
  return (items ?? []).map(item => ({ ...item, id: createId() }))
}

export function getShowcaseVisibleCount(props: Pick<ShowcaseBlockProps, 'layout' | 'columns'>): number {
  if (props.layout === 'cards') {
    return Math.min(SHOWCASE_MAX_ITEMS, Math.max(1, props.columns ?? 3))
  }

  return 1
}

export function ensureShowcaseItems(items: ShowcaseItem[] | undefined, count: number, createId: () => string): ShowcaseItem[] {
  const next = (items ?? []).map(item => ({ ...item }))
  const target = Math.min(SHOWCASE_MAX_ITEMS, Math.max(1, count))

  while (next.length < target) {
    next.push(createShowcaseItem(createId(), next.length))
  }

  return next
}

export function getVisibleShowcaseItems(props: ShowcaseBlockProps): ShowcaseItem[] {
  const count = getShowcaseVisibleCount(props)
  const items = (props.items ?? []).filter((item): item is ShowcaseItem => Boolean(item && typeof item === 'object'))

  if (items.length >= count) {
    return items.slice(0, count)
  }

  return [
    ...items,
    ...DEFAULT_SHOWCASE_ITEMS.slice(items.length, count).map(item => ({ ...item }))
  ]
}

export function resolveShowcaseVisualKind(item: ShowcaseItem): ShowcaseVisualKind {
  if (item.visualKind === 'image' && item.imageSrc?.trim()) {
    return 'image'
  }

  if (item.visualKind === 'logo' && (item.logoSrc?.trim() || item.logoText?.trim())) {
    return 'logo'
  }

  if (item.visualKind === 'animation') {
    return 'animation'
  }

  if (item.imageSrc?.trim()) {
    return 'image'
  }

  return 'animation'
}

export function updateShowcaseItem(
  items: ShowcaseItem[],
  itemId: string,
  changes: Partial<ShowcaseItem>
): ShowcaseItem[] {
  return items.map(item => (item.id === itemId ? { ...item, ...changes } : item))
}

export function isLayeredShowcase(props: Pick<ShowcaseBlockProps, 'layout' | 'cardStyle'>): boolean {
  return props.cardStyle === 'layered' && (props.layout === 'stack' || props.layout === 'cards')
}
