import { DEFAULT_HERO_SPLIT_VISUAL_ANIMATION } from '../constants/heroVisual'
import { getBlockBackgroundOpacity } from './sectionStyleHelpers'
import type { SectionBlockProps, SplitVisualConfig } from '../types'

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

export function shouldRenderSectionSplitVisual(props: SectionBlockProps): boolean {
  if (getBlockBackgroundOpacity(props) < 100) {
    return false
  }

  return getSectionSplitVisualAnimation(props) !== 'static'
}

/** Full-section animated layer — single-column layouts only. */
export function shouldRenderSectionBackgroundVisual(props: SectionBlockProps): boolean {
  if (!shouldRenderSectionSplitVisual(props)) {
    return false
  }

  return props.layout === 'default'
}

/** Per-column animated layer — split layouts apply animation at the layout/column level. */
export function shouldRenderSectionColumnVisual(props: SectionBlockProps): boolean {
  if (props.layout !== 'split-horizontal' && props.layout !== 'split-vertical') {
    return false
  }

  if (getBlockBackgroundOpacity(props) < 100) {
    return false
  }

  return getSectionSplitVisualAnimation(props) !== 'static'
}
