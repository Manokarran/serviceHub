import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'

/**
 * What the request applies to. Resolved from an explicit toggle in the panel, never
 * inferred from the selection — a page request must not silently become a control edit.
 */
export type DesignScope = 'control' | 'page'

export type DesignPalette = {
  accent: string
  background: string
  text: string
  surface: string
  gradientStart: string
  gradientEnd: string
}

/**
 * A costed-out redesign the user has not accepted yet. Nothing touches the draft until
 * they confirm, so a page redesign is always reviewable before it lands.
 */
export type DesignProposal = {
  scope: DesignScope

  /** Page the proposal was built against; applying it anywhere else is invalid. */
  pageSlug: string

  /** Human name for what changes, e.g. "the hero control" or "the Home page". */
  targetLabel: string

  /** Block being replaced when scope is control; null for a page redesign. */
  targetBlockId: string | null

  concept: string
  rationale: string
  palette: DesignPalette
  fontLabel: string
  motionLabel: string
  highlights: string[]

  /** Replacement blocks: the single restyled control, or every block on the page. */
  blocks: Block[]

  /** New page tokens. Only ever set for a page redesign. */
  siteStyles: SiteStyles | null

  rewordedFields: number
  photoCount: number

  /** Photo URLs chosen for this proposal — shown in chat before the user applies. */
  photoPreviews: Array<{ url: string; alt: string; label: string }>

  usedOpenAi: boolean
}

export type RewordResult = {
  blocks: Block[]
  targetBlockId: string | null
  changed: number
  note: string
}
