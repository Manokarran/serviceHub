import { isTwoColumnFamily } from './sectionLayout'
import type { SectionLayout, SectionVisualPlacement } from '../types'

type SectionVisualPlacementOption = {
  value: SectionVisualPlacement
  label: string
  icon: string
}

export function getSectionVisualPlacementOptions(layout: SectionLayout): SectionVisualPlacementOption[] {
  if (layout === 'split-vertical') {
    return [
      { value: 'primary', label: 'Top row', icon: 'ri-layout-top-line' },
      { value: 'secondary', label: 'Bottom row', icon: 'ri-layout-bottom-line' },
      { value: 'background', label: 'Full section', icon: 'ri-layout-grid-line' }
    ]
  }

  // Two-column family + multi-column: primary/secondary visuals only (v1).
  if (isTwoColumnFamily(layout) || layout === 'columns-3' || layout === 'columns-4') {
    return [
      { value: 'primary', label: 'Left column', icon: 'ri-layout-left-line' },
      { value: 'secondary', label: 'Right column', icon: 'ri-layout-right-line' },
      { value: 'background', label: 'Full section', icon: 'ri-layout-row-line' }
    ]
  }

  return []
}

export function getSectionVisualPlacementHint(
  layout: SectionLayout,
  placement: SectionVisualPlacement,
  columnTarget?: 'full' | 'primary' | 'secondary'
): string {
  if (columnTarget === 'primary') {
    return layout === 'split-vertical'
      ? 'Animation and colors for the top row, behind its blocks.'
      : 'Animation and colors for the left column, behind its blocks.'
  }

  if (columnTarget === 'secondary') {
    return layout === 'split-vertical'
      ? 'Animation and colors for the bottom row, behind its blocks.'
      : 'Animation and colors for the right column, behind its blocks.'
  }

  if (layout === 'default') {
    return 'Animated layer behind all content in this section.'
  }

  if (placement === 'background' || columnTarget === 'full') {
    return 'Animated layer spans the full section behind both columns.'
  }

  if (layout === 'split-vertical') {
    return placement === 'primary'
      ? 'Animated layer fills the top row when it has no blocks.'
      : 'Animated layer fills the bottom row when it has no blocks.'
  }

  return placement === 'primary'
    ? 'Animated layer fills the left column when it has no blocks.'
    : 'Animated layer fills the right column when it has no blocks.'
}
