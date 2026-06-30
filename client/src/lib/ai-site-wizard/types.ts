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

export type AiSiteGenerationPreview = {
  templateId: string
  templateName: string
  layoutReason: string
  layoutMatchScore: number
  styleThemeId: string
  stylePageAnimation: string
  styleGradientId: string
  pages: AiCustomizedPage[]
  usedOpenAi: boolean
}
