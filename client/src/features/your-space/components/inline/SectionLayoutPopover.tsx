'use client'

import type { SectionBlockProps } from '../../types'
import { SectionLayoutControls } from '../SectionLayoutControls'

type Props = {
  props: SectionBlockProps
  onUpdate: (changes: Partial<SectionBlockProps>) => void
}

export function SectionLayoutPopover({ props, onUpdate }: Props) {
  return <SectionLayoutControls props={props} onUpdate={onUpdate} />
}
