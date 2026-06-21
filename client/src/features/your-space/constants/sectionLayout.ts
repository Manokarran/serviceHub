import type { SectionLayout } from '../types'

type SectionLayoutOption = {
  value: SectionLayout
  label: string
  icon: string
}

export const SECTION_LAYOUT_OPTIONS: SectionLayoutOption[] = [
  { value: 'default', label: 'Single', icon: 'ri-layout-row-line' },
  { value: 'split-horizontal', label: 'Double', icon: 'ri-layout-column-line' },
  { value: 'split-vertical', label: 'Stacked', icon: 'ri-layout-grid-line' }
]
