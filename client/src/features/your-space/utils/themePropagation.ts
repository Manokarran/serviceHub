import type {
  Block,
  BlockPropsMap,
  BlockType,
  CarouselBlockProps,
  SectionBlockProps,
  TabsBlockProps
} from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { asBlockProps, readBlockProps } from './blockProps'
import { applySiteThemeToBlockProps } from './siteStylesHelpers'

/**
 * `conservative` only rewrites values that still match what the outgoing theme
 * produced, so hand-picked colors survive. `force` rewrites every theme-driven
 * value and is meant for an explicit "redesign this page" request.
 */
export type ThemePropagationMode = 'conservative' | 'force'

function themePatchForBlock(
  block: Block,
  previous: SiteStyles,
  next: SiteStyles,
  mode: ThemePropagationMode
): Record<string, unknown> {
  const props = readBlockProps(block.props)
  const type = block.type as BlockType
  const typedProps = asBlockProps(props) as BlockPropsMap[BlockType]

  const derivedPrevious = readBlockProps(applySiteThemeToBlockProps(type, typedProps, previous))
  const derivedNext = readBlockProps(applySiteThemeToBlockProps(type, typedProps, next))

  const patch: Record<string, unknown> = {}

  for (const [key, nextValue] of Object.entries(derivedNext)) {
    if (nextValue === props[key]) {
      continue
    }

    // Keys the theme mapper leaves untouched carry identical values on both sides.
    if (derivedPrevious[key] === nextValue) {
      continue
    }

    if (mode === 'force' || props[key] === derivedPrevious[key]) {
      patch[key] = nextValue
    }
  }

  return patch
}

function mapChildren(block: Block, mapper: (children: Block[]) => Block[]): Block | null {
  if (block.type === 'section') {
    const props = block.props as SectionBlockProps

    return {
      ...block,
      props: {
        ...props,
        children: mapper(props.children ?? []),
        primaryChildren: mapper(props.primaryChildren ?? []),
        secondaryChildren: mapper(props.secondaryChildren ?? []),
        tertiaryChildren: mapper(props.tertiaryChildren ?? []),
        quaternaryChildren: mapper(props.quaternaryChildren ?? [])
      }
    }
  }

  if (block.type === 'carousel') {
    const props = block.props as CarouselBlockProps

    return {
      ...block,
      props: { ...props, slides: props.slides.map(slide => ({ ...slide, children: mapper(slide.children ?? []) })) }
    }
  }

  if (block.type === 'tabs') {
    const props = block.props as TabsBlockProps

    return {
      ...block,
      props: { ...props, tabs: props.tabs.map(panel => ({ ...panel, children: mapper(panel.children ?? []) })) }
    }
  }

  return null
}

/**
 * Re-derive theme-driven block colors after the site theme changes. Without this
 * a theme swap only repaints the page shell and leaves every existing control
 * carrying the previous palette.
 */
export function reharmonizeBlockTreeToTheme(
  blocks: Block[],
  previous: SiteStyles,
  next: SiteStyles,
  mode: ThemePropagationMode = 'conservative'
): { blocks: Block[]; changed: number } {
  let changed = 0

  const walk = (list: Block[]): Block[] =>
    list.map(block => {
      const patch = themePatchForBlock(block, previous, next, mode)
      const withChildren = mapChildren(block, walk)
      const base = withChildren ?? block

      if (Object.keys(patch).length === 0) {
        return base
      }

      changed += 1

      return { ...base, props: asBlockProps({ ...readBlockProps(base.props), ...patch }) }
    })

  return { blocks: walk(blocks), changed }
}
