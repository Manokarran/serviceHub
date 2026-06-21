'use client'

import type { HeroBlockProps } from '../../types'
import { useSiteStyles } from '../SiteStylesScope'
import { HeroLayoutControls } from '../HeroLayoutControls'

type Props = {
  props: HeroBlockProps
  onUpdate: (changes: Partial<HeroBlockProps>) => void
}

export function HeroLayoutPopover({ props, onUpdate }: Props) {
  const siteStyles = useSiteStyles()

  return <HeroLayoutControls props={props} accentColor={siteStyles.colors.accent} onUpdate={onUpdate} />
}
