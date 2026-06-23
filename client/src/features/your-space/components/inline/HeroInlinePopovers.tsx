'use client'

import type { HeroBlockProps } from '../../types'
import { HeroLayoutControls } from '../HeroLayoutControls'

type Props = {
  props: HeroBlockProps
  onUpdate: (changes: Partial<HeroBlockProps>) => void
}

export function HeroLayoutPopover({ props, onUpdate }: Props) {
  return <HeroLayoutControls props={props} onUpdate={onUpdate} />
}
