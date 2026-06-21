'use client'

import type { TextAlign } from '../../types'
import { InlineToolbarButton } from './InlineToolbarUi'

const ALIGN_OPTIONS: { value: TextAlign; icon: string; label: string }[] = [
  { value: 'left', icon: 'ri-align-left', label: 'Align left' },
  { value: 'center', icon: 'ri-align-center', label: 'Align center' },
  { value: 'right', icon: 'ri-align-right', label: 'Align right' }
]

export function AlignmentToggleGroup({
  value,
  onChange
}: {
  value: TextAlign
  onChange: (value: TextAlign) => void
}) {
  return (
    <>
      {ALIGN_OPTIONS.map(option => (
        <InlineToolbarButton
          key={option.value}
          icon={option.icon}
          label={option.label}
          active={value === option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </>
  )
}
