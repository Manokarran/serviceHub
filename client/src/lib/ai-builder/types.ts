import type { BlockType } from '@/features/your-space/types'
import type {
  ButtonStyleConfig,
  SiteColors,
  SiteFonts,
  SiteForms,
  SiteMisc,
  SiteStyles
} from '@/features/your-space/types/siteStyles'

export type AiBuilderPrimitive = string | number | boolean

/**
 * Controls are addressed by short refs (`c1`, `c2`, …) instead of block ids.
 * Refs keep the prompt small and stop the model inventing uuids — the client
 * maps them back to real ids when the plan is applied.
 */
export type AiBuilderTarget = string

export type AiBuilderInsertPosition = 'before' | 'after' | 'inside-start' | 'inside-end' | 'page-end'

export type AiBuilderInsertAt = {
  position: AiBuilderInsertPosition

  /** Reference control. Defaults to the selected control. */
  ref?: AiBuilderTarget
}

export type AiBuilderStyleChanges = {
  themeId?: string
  colors?: Partial<SiteColors>
  fonts?: Partial<SiteFonts>
  forms?: Partial<SiteForms>
  misc?: Partial<SiteMisc>
  buttons?: {
    primary?: Partial<ButtonStyleConfig>
    secondary?: Partial<ButtonStyleConfig>
    tertiary?: Partial<ButtonStyleConfig>
  }
}

/**
 * How far a theme change reaches into existing controls.
 * - `none`: repaint the page shell only
 * - `match`: also restyle controls that still carry the outgoing theme's colors
 * - `rebuild`: restyle every control, discarding hand-picked colors
 */
export type AiBuilderRestyleScope = 'none' | 'match' | 'rebuild'

export type AiBuilderOperation =
  | {
      kind: 'apply_theme'
      themeId: string
      restyleControls?: AiBuilderRestyleScope
      reason: string
    }
  | {
      kind: 'update_site_styles'
      changes: AiBuilderStyleChanges
      restyleControls?: AiBuilderRestyleScope
      reason: string
    }
  | {
      kind: 'add_block'
      type: BlockType
      paletteId?: string
      props?: Record<string, AiBuilderPrimitive>
      at?: AiBuilderInsertAt
      reason: string
    }
  | {
      kind: 'update_block'
      target: AiBuilderTarget
      props: Record<string, AiBuilderPrimitive>
      reason: string
    }
  | {
      kind: 'delete_block'
      target: AiBuilderTarget
      reason: string
    }

export type AiBuilderPlan = {
  reply: string
  operations: AiBuilderOperation[]
}

/** One control in the page outline sent to the model. */
export type AiBuilderOutlineNode = {
  ref: AiBuilderTarget
  type: BlockType

  /** Short copy excerpt so similar controls can be told apart. */
  label?: string

  /** 0 for page-level controls, 1+ for nested children. */
  depth: number
  parentRef?: AiBuilderTarget

  /** Resolved background, so the model can keep contrast sane. */
  background?: string
}

export type AiBuilderThemeSummary = {
  id: string
  accent: string
  background: string
  text: string
  swatches: string[]
  headingFamily: string
  bodyFamily: string
  headingSize: number
  bodySize: number
  buttonShape: string
  spacing: string
}

export type AiBuilderContext = {
  page: string
  theme: AiBuilderThemeSummary
  outline: AiBuilderOutlineNode[]
  selected: {
    ref: AiBuilderTarget
    type: BlockType

    /** Only schema-known props that are actually set — nested trees are stripped. */
    props: Record<string, unknown>
  } | null
}

/** Client-side pairing of the model-facing context with the ref → block id map. */
export type AiBuilderContextBundle = {
  context: AiBuilderContext
  refToId: Record<string, string>
}

export type { SiteStyles }
