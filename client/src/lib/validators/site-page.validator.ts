import { z } from 'zod'

import { HERO_SPLIT_VISUAL_ANIMATION_OPTIONS } from '@/features/your-space/constants/heroVisual'

const blockTypeSchema = z.enum([
  'section',
  'carousel',
  'tabs',
  'header',
  'footer',
  'hero',
  'heading',
  'text',
  'button',
  'image',
  'video',
  'logo',
  'shape',
  'icon',
  'contactForm'
])

const heroSplitVisualAnimationSchema = z.enum(
  HERO_SPLIT_VISUAL_ANIMATION_OPTIONS.map(option => option.value) as [
    (typeof HERO_SPLIT_VISUAL_ANIMATION_OPTIONS)[number]['value'],
    ...(typeof HERO_SPLIT_VISUAL_ANIMATION_OPTIONS)[number]['value'][]
  ]
)

export const sitePageBlockSchema = z.object({
  id: z.string().min(1).max(128),
  type: blockTypeSchema,
  props: z.record(z.string(), z.unknown())
})

const buttonShapeSchema = z.enum(['square', 'rounded', 'pill'])
const buttonStyleSchema = z.enum(['solid', 'outline', 'ghost'])
const fontSourceSchema = z.enum(['heading', 'body'])

const buttonStyleConfigSchema = z.object({
  shape: buttonShapeSchema,
  style: buttonStyleSchema,
  fontSource: fontSourceSchema,
  borderWidth: z.number().min(0).max(8),
  paddingX: z.number().min(8).max(64),
  paddingY: z.number().min(4).max(32)
})

export const siteStylesSchema = z.object({
  themeId: z.string().max(64),
  fonts: z.object({
    headingFamily: z.string().max(200),
    bodyFamily: z.string().max(200),
    headingWeight: z.number().min(100).max(900),
    bodyWeight: z.number().min(100).max(900),
    headingScale: z.number().min(0.5).max(2),
    bodySize: z.number().min(12).max(24),
    headingLetterSpacing: z.number().min(-0.1).max(0.2)
  }),
  colors: z.object({
    swatch1: z.string().max(32),
    swatch2: z.string().max(32),
    swatch3: z.string().max(32),
    swatch4: z.string().max(32),
    swatch5: z.string().max(32),
    accent: z.string().max(32),
    background: z.string().max(32),
    text: z.string().max(32)
  }),
  buttons: z.object({
    primary: buttonStyleConfigSchema,
    secondary: buttonStyleConfigSchema,
    tertiary: buttonStyleConfigSchema
  }),
  forms: z.object({
    fieldShape: buttonShapeSchema,
    fieldBorderWidth: z.number().min(0).max(4),
    fieldBorderColor: z.string().max(32),
    fieldBackground: z.string().max(32),
    labelFontSource: fontSourceSchema
  }),
  misc: z.object({
    animation: z.enum(['none', 'fade', 'slide-up', 'scale']),
    spacingScale: z.enum(['compact', 'default', 'spacious']),
    canvasCornerRadius: z.number().min(0).max(48).optional(),
    imageCornerRadius: z.number().min(0).max(32),
    imageHoverEffect: z.enum(['none', 'zoom', 'fade']),
    imageAspectRatio: z.enum(['auto', '16/9', '4/3', '1/1']),
    pageSplitVisualAnimation: heroSplitVisualAnimationSchema.optional(),
    pageSplitVisualColorStart: z.string().max(32).optional(),
    pageSplitVisualColorEnd: z.string().max(32).optional()
  })
})

export const saveSitePageSchema = z.object({
  blocks: z.array(sitePageBlockSchema).max(100),
  siteStyles: siteStylesSchema.optional()
})

export const createPageSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL must be lowercase letters, numbers, and hyphens')
    .optional()
})

export const updatePageMetaSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(300).optional(),
  sortOrder: z.number().min(0).max(999).optional()
})

export const reorderPagesSchema = z.object({
  orderedSlugs: z.array(z.string().min(1).max(64)).min(1).max(50)
})

export type SaveSitePageInput = z.infer<typeof saveSitePageSchema>
