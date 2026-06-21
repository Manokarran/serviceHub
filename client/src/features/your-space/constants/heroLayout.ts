import type { HeroLayout } from '../types'

type HeroLayoutOption = {
  value: HeroLayout
  label: string
  icon: string
}

export const HERO_LAYOUT_OPTIONS: HeroLayoutOption[] = [
  { value: 'centered', label: 'Centered', icon: 'ri-align-center' },
  { value: 'split-left', label: 'Split left', icon: 'ri-layout-left-line' },
  { value: 'split-right', label: 'Split right', icon: 'ri-layout-right-line' }
]
