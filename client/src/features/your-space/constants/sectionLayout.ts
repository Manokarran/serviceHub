import type { Block, SectionBlockProps, SectionLayout } from '../types'

export type SectionSplitColumn = 'primary' | 'secondary' | 'tertiary' | 'quaternary'

/** All section child slots — used when walking the tree so orphaned columns stay reachable. */
export const ALL_SECTION_COLUMNS = [
  'default',
  'primary',
  'secondary',
  'tertiary',
  'quaternary'
] as const

type SectionLayoutOption = {
  value: SectionLayout
  label: string
  icon: string
  description?: string
}

/** Ordered drop-zone columns for a section layout (excludes single-column `default`). */
export function getSectionColumnsForLayout(layout: SectionLayout): SectionSplitColumn[] {
  switch (layout) {
    case 'columns-4':
      return ['primary', 'secondary', 'tertiary', 'quaternary']
    case 'columns-3':
      return ['primary', 'secondary', 'tertiary']
    case 'split-horizontal':
    case 'split-vertical':
    case 'sidebar-left':
    case 'sidebar-right':
    case 'split-1-2':
    case 'split-2-1':
      return ['primary', 'secondary']
    default:
      return []
  }
}

export function isSplitSectionLayout(layout: SectionLayout | undefined): boolean {
  return getSectionColumnsForLayout(layout ?? 'default').length >= 2
}

export function isHorizontalSectionLayout(layout: SectionLayout | undefined): boolean {
  const value = layout ?? 'default'

  return (
    value === 'split-horizontal' ||
    value === 'sidebar-left' ||
    value === 'sidebar-right' ||
    value === 'split-1-2' ||
    value === 'split-2-1' ||
    value === 'columns-3' ||
    value === 'columns-4'
  )
}

export function isMultiColumnLayout(layout: SectionLayout | undefined): boolean {
  return layout === 'columns-3' || layout === 'columns-4'
}

export function isTwoColumnFamily(layout: SectionLayout | undefined): boolean {
  const value = layout ?? 'default'

  return (
    value === 'split-horizontal' ||
    value === 'split-vertical' ||
    value === 'sidebar-left' ||
    value === 'sidebar-right' ||
    value === 'split-1-2' ||
    value === 'split-2-1'
  )
}

/**
 * Flex weights for each split column. Two-column asymmetric layouts use percentage-like
 * weights; equal multi-column layouts use unit weights.
 */
export function getSectionColumnWeights(layout: SectionLayout, splitRatio = 50): number[] {
  switch (layout) {
    case 'columns-3':
      return [1, 1, 1]
    case 'columns-4':
      return [1, 1, 1, 1]
    case 'split-horizontal':
    case 'split-vertical':
    case 'sidebar-left':
    case 'sidebar-right':
    case 'split-1-2':
    case 'split-2-1': {
      const primary = Math.min(70, Math.max(30, splitRatio))

      return [primary, 100 - primary]
    }
    default:
      return []
  }
}

export function getDefaultSplitRatioForLayout(layout: SectionLayout): number {
  switch (layout) {
    case 'sidebar-left':
      return 30
    case 'sidebar-right':
      return 70
    case 'split-1-2':
      return 33
    case 'split-2-1':
      return 67
    default:
      return 50
  }
}

export const SECTION_LAYOUT_OPTIONS: SectionLayoutOption[] = [
  { value: 'default', label: 'Single', icon: 'ri-layout-row-line', description: 'One content column' },
  { value: 'split-horizontal', label: 'Double', icon: 'ri-layout-column-line', description: 'Two equal columns' },
  { value: 'split-vertical', label: 'Stacked', icon: 'ri-layout-grid-line', description: 'Two stacked rows' },
  { value: 'sidebar-left', label: 'Sidebar left', icon: 'ri-layout-left-line', description: 'Narrow left, wide right' },
  { value: 'sidebar-right', label: 'Sidebar right', icon: 'ri-layout-right-line', description: 'Wide left, narrow right' },
  { value: 'split-2-1', label: 'Wide + narrow', icon: 'ri-layout-2-line', description: 'Two-thirds then one-third' },
  { value: 'split-1-2', label: 'Narrow + wide', icon: 'ri-layout-3-line', description: 'One-third then two-thirds' },
  { value: 'columns-3', label: 'Three columns', icon: 'ri-layout-column-fill', description: 'Three equal columns' },
  { value: 'columns-4', label: 'Four columns', icon: 'ri-grid-line', description: 'Four equal columns' }
]

/**
 * Remap section children when changing layout so content is never deleted.
 * Collapsing 3/4 → 2/single appends orphaned columns into secondary (or children).
 * Expanding 2 → 3/4 leaves new columns empty.
 */
export function applySectionLayoutChange(
  props: SectionBlockProps,
  nextLayout: SectionLayout
): Partial<SectionBlockProps> {
  if (props.layout === nextLayout) {
    return { layout: nextLayout }
  }

  const prevColumns = getSectionColumnsForLayout(props.layout)
  const nextColumns = getSectionColumnsForLayout(nextLayout)

  let children = [...(props.children ?? [])]
  let primaryChildren = [...(props.primaryChildren ?? [])]
  let secondaryChildren = [...(props.secondaryChildren ?? [])]
  let tertiaryChildren = [...(props.tertiaryChildren ?? [])]
  let quaternaryChildren = [...(props.quaternaryChildren ?? [])]

  const columnBagters: Record<SectionSplitColumn, Block[]> = {
    primary: primaryChildren,
    secondary: secondaryChildren,
    tertiary: tertiaryChildren,
    quaternary: quaternaryChildren
  }

  // Single → multi: move default children into the first column.
  if (prevColumns.length === 0 && nextColumns.length > 0 && children.length > 0) {
    columnBagters.primary = [...children, ...columnBagters.primary]
    children = []
  }

  // Collect blocks from columns that will no longer exist.
  const orphaned: Block[] = []

  for (const column of ['primary', 'secondary', 'tertiary', 'quaternary'] as SectionSplitColumn[]) {
    if (!nextColumns.includes(column) && columnBagters[column].length > 0) {
      orphaned.push(...columnBagters[column])
      columnBagters[column] = []
    }
  }

  if (orphaned.length > 0) {
    if (nextColumns.length === 0) {
      children = [...children, ...orphaned]
    } else if (nextColumns.includes('secondary')) {
      columnBagters.secondary = [...columnBagters.secondary, ...orphaned]
    } else {
      columnBagters.primary = [...columnBagters.primary, ...orphaned]
    }
  }

  const splitRatio = isTwoColumnFamily(nextLayout)
    ? nextLayout === 'split-horizontal' || nextLayout === 'split-vertical'
      ? (props.splitRatio ?? 50)
      : getDefaultSplitRatioForLayout(nextLayout)
    : (props.splitRatio ?? 50)

  return {
    layout: nextLayout,
    children,
    primaryChildren: columnBagters.primary,
    secondaryChildren: columnBagters.secondary,
    tertiaryChildren: nextColumns.includes('tertiary') ? columnBagters.tertiary : [],
    quaternaryChildren: nextColumns.includes('quaternary') ? columnBagters.quaternary : [],
    splitRatio
  }
}

export function getSectionColumnEmptyLabel(
  layout: SectionLayout,
  column: SectionSplitColumn | 'default'
): string {
  if (column === 'default') {
    return 'Drop heading, text, button, image, video, logo, carousel, tabs, or shape blocks here'
  }

  if (layout === 'split-vertical') {
    return column === 'primary' ? 'Drop blocks in the top row' : 'Drop blocks in the bottom row'
  }

  const labels: Record<SectionSplitColumn, string> = {
    primary: 'Drop blocks in column 1',
    secondary: 'Drop blocks in column 2',
    tertiary: 'Drop blocks in column 3',
    quaternary: 'Drop blocks in column 4'
  }

  if (layout === 'split-horizontal' || layout === 'sidebar-left' || layout === 'sidebar-right' || layout === 'split-1-2' || layout === 'split-2-1') {
    if (column === 'primary') {
      return 'Drop blocks in the left column'
    }

    if (column === 'secondary') {
      return 'Drop blocks in the right column'
    }
  }

  return labels[column]
}

export function getSectionColumnShortLabel(
  layout: SectionLayout,
  column: SectionSplitColumn | 'default'
): string {
  if (column === 'default') {
    return 'section'
  }

  if (layout === 'split-vertical') {
    return column === 'primary' ? 'top row' : 'bottom row'
  }

  if (column === 'primary') {
    return layout === 'columns-3' || layout === 'columns-4' ? 'column 1' : 'left column'
  }

  if (column === 'secondary') {
    return layout === 'columns-3' || layout === 'columns-4' ? 'column 2' : 'right column'
  }

  if (column === 'tertiary') {
    return 'column 3'
  }

  return 'column 4'
}
