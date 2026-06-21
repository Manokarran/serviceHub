import { DEFAULT_HERO_SPLIT_VISUAL_ANIMATION } from '../constants/heroVisual'
import { getBlockBackgroundOpacity } from './sectionStyleHelpers'
import type { SectionBlockProps } from '../types'

export function getSectionSplitVisualAnimation(props: SectionBlockProps) {
  return props.splitVisualAnimation ?? DEFAULT_HERO_SPLIT_VISUAL_ANIMATION
}

export function shouldRenderSectionSplitVisual(props: SectionBlockProps): boolean {
  if (getBlockBackgroundOpacity(props) < 100) {
    return false
  }

  return getSectionSplitVisualAnimation(props) !== 'static'
}

export function shouldRenderSectionBackgroundVisual(props: SectionBlockProps): boolean {
  return props.layout === 'default' && shouldRenderSectionSplitVisual(props)
}

export function shouldRenderSectionColumnVisual(props: SectionBlockProps, hasColumnContent: boolean): boolean {
  if (props.layout !== 'split-horizontal' && props.layout !== 'split-vertical') {
    return false
  }

  if (hasColumnContent) {
    return false
  }

  return shouldRenderSectionSplitVisual(props)
}
