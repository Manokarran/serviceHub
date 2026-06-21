'use client'

import type { SectionBlockProps } from '../../types'
import { useSiteStyles } from '../SiteStylesScope'
import { SectionLayoutControls } from '../SectionLayoutControls'

type Props = {
  props: SectionBlockProps
  onUpdate: (changes: Partial<SectionBlockProps>) => void
}

export function SectionLayoutPopover({ props, onUpdate }: Props) {
  const siteStyles = useSiteStyles()

  return <SectionLayoutControls props={props} accentColor={siteStyles.colors.accent} onUpdate={onUpdate} />
}
