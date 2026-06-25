import { DEFAULT_HERO_SPLIT_VISUAL_ANIMATION } from '../constants/heroVisual'
import { isEffectiveAnimatedBackgroundMode } from './sectionStyleHelpers'
import type { SectionBlockProps, SectionVisualPlacement, SplitVisualConfig } from '../types'

export function getSectionSplitVisualAnimation(props: SectionBlockProps) {
  return props.splitVisualAnimation ?? DEFAULT_HERO_SPLIT_VISUAL_ANIMATION
}

export function getSectionSplitVisualConfig(props: SectionBlockProps): SplitVisualConfig {
  return {
    splitVisualAnimation: props.splitVisualAnimation,
    splitVisualColorStart: props.splitVisualColorStart,
    splitVisualColorEnd: props.splitVisualColorEnd
  }
}

export function getSectionVisualPlacement(props: SectionBlockProps): SectionVisualPlacement {
  return props.splitVisualPlacement ?? 'background'
}

export function shouldRenderSectionSplitVisual(props: SectionBlockProps): boolean {
  return isEffectiveAnimatedBackgroundMode(props)
}

/** Full-section animated layer — single-column layouts, or split with full-section placement. */
export function shouldRenderSectionBackgroundVisual(props: SectionBlockProps): boolean {
  if (!shouldRenderSectionSplitVisual(props)) {
    return false
  }

  if (props.layout === 'default') {
    return true
  }

  return getSectionVisualPlacement(props) === 'background'
}

/** Per-column animated layer — split layouts with column-specific placement. */
export function shouldRenderSectionColumnVisual(
  props: SectionBlockProps,
  column: 'primary' | 'secondary'
): boolean {
  if (props.layout !== 'split-horizontal' && props.layout !== 'split-vertical') {
    return false
  }

  if (!shouldRenderSectionSplitVisual(props)) {
    return false
  }

  return getSectionVisualPlacement(props) === column
}
