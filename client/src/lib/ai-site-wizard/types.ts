import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'

export type AiTemplateRecommendation = {
  templateId: string
  headline: string
  reason: string
  matchScore: number
}

export type AiCustomizedPage = {
  slug: string
  title: string
  description: string
  blocks: Block[]
  siteStyles?: SiteStyles | null
}

export type AiDesignPalette = {
  accent: string
  background: string
  text: string
  surface: string
  gradientStart: string
  gradientEnd: string
}

export type AiSiteGenerationPreview = {
  templateId: string
  templateName: string
  layoutReason: string
  layoutMatchScore: number
  styleThemeId: string
  stylePageAnimation: string
  styleGradientId: string
  styleFontFamily: string
  photoCount: number
  generationNotes: string[]
  source: 'library' | 'workspace' | 'starter'
  pages: AiCustomizedPage[]
  usedOpenAi: boolean

  /** Short name the art director gave this direction, e.g. "Coastal Warehouse". */
  designConcept: string
  designRationale: string
  designFontId: string
  designPalette: AiDesignPalette
  designColorMode: 'light' | 'dark'
  designDensity: string
  designCorners: string
  designHeroLayout: string

  /** False when the deterministic engine produced the look instead of the model. */
  designByAi: boolean
}
