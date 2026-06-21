import { z } from 'zod'

const blockTypeSchema = z.enum(['section', 'header', 'hero', 'heading', 'text', 'button'])

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
    imageCornerRadius: z.number().min(0).max(32),
    imageHoverEffect: z.enum(['none', 'zoom', 'fade']),
    imageAspectRatio: z.enum(['auto', '16/9', '4/3', '1/1'])
  })
})

export const saveSitePageSchema = z.object({
  blocks: z.array(sitePageBlockSchema).max(100),
  siteStyles: siteStylesSchema.optional()
})

export type SaveSitePageInput = z.infer<typeof saveSitePageSchema>
