'use server'

import { z } from 'zod'

import { auth } from '@/lib/auth'
import { formatActionError } from '@/lib/auth/resolve-session-user-id'
import { BLOCK_TYPES, type BlockType } from '@/features/your-space/types'
import { PALETTE_ITEMS } from '@/features/your-space/constants'
import { SITE_THEME_PRESETS } from '@/features/your-space/constants/siteStylePresets'
import { describePageOutline, relevantControlTypes } from '@/lib/ai-builder/context'
import { describeControlCapabilities } from '@/lib/ai-builder/control-schema'
import { createLocalAiBuilderPlan, getRequestedAiBuilderBlocks } from '@/lib/ai-builder/planner'
import type { AiBuilderContext, AiBuilderPlan } from '@/lib/ai-builder/types'
import { createJsonCompletion, getOpenAiModel, isOpenAiConfigured } from '@/lib/openai/client'

const primitiveSchema = z.union([z.string().max(2000), z.number(), z.boolean()])
const blockTypeSchema = z.enum(BLOCK_TYPES)
const targetSchema = z.string().min(1).max(200)
const restyleSchema = z.enum(['none', 'match', 'rebuild'])
const propsSchema = z.record(z.string().max(60), primitiveSchema).refine(value => Object.keys(value).length <= 16)

const styleChangesSchema = z
  .object({
    themeId: z.string().max(80).optional(),
    colors: z
      .object({
        swatch1: z.string().max(80).optional(),
        swatch2: z.string().max(80).optional(),
        swatch3: z.string().max(80).optional(),
        swatch4: z.string().max(80).optional(),
        swatch5: z.string().max(80).optional(),
        accent: z.string().max(80).optional(),
        background: z.string().max(80).optional(),
        text: z.string().max(80).optional()
      })
      .partial()
      .optional(),
    fonts: z
      .object({
        headingFamily: z.string().max(120).optional(),
        bodyFamily: z.string().max(120).optional(),
        headingWeight: z.number().min(100).max(900).optional(),
        bodyWeight: z.number().min(100).max(900).optional(),
        headingSize: z.number().min(12).max(120).optional(),
        headingScale: z.number().min(0.5).max(2).optional(),
        bodySize: z.number().min(10).max(32).optional(),
        headingLetterSpacing: z.number().min(-0.2).max(0.2).optional(),
        buttonSize: z.number().min(10).max(32).optional(),
        navSize: z.number().min(10).max(32).optional(),
        labelSize: z.number().min(9).max(24).optional(),
        logoSize: z.number().min(12).max(48).optional()
      })
      .partial()
      .optional(),
    forms: z
      .object({
        fieldShape: z.enum(['square', 'rounded', 'pill']).optional(),
        fieldBorderWidth: z.number().min(0).max(8).optional(),
        fieldBorderColor: z.string().max(80).optional(),
        fieldBackground: z.string().max(80).optional(),
        fieldFontSize: z.number().min(10).max(32).optional()
      })
      .partial()
      .optional(),
    misc: z
      .object({
        animation: z.enum(['none', 'fade', 'slide-up', 'scale']).optional(),
        spacingScale: z.enum(['compact', 'default', 'spacious']).optional(),
        canvasCornerRadius: z.number().min(0).max(48).optional(),
        imageCornerRadius: z.number().min(0).max(48).optional(),
        imageHoverEffect: z.enum(['none', 'zoom', 'fade', 'lift', 'blur', 'grayscale']).optional(),
        imageAspectRatio: z.enum(['auto', '16/9', '4/3', '1/1']).optional()
      })
      .partial()
      .optional(),
    buttons: z
      .object({
        primary: z
          .object({
            shape: z.enum(['square', 'rounded', 'pill']).optional(),
            style: z.enum(['solid', 'outline', 'ghost']).optional(),
            borderWidth: z.number().min(0).max(8).optional(),
            paddingX: z.number().min(0).max(64).optional(),
            paddingY: z.number().min(0).max(40).optional()
          })
          .partial()
          .optional(),
        secondary: z
          .object({
            shape: z.enum(['square', 'rounded', 'pill']).optional(),
            style: z.enum(['solid', 'outline', 'ghost']).optional()
          })
          .partial()
          .optional()
      })
      .partial()
      .optional()
  })
  .partial()

const operationSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('apply_theme'),
    themeId: z.string().max(80),
    restyleControls: restyleSchema.optional(),
    reason: z.string().max(240).default('Applied the requested visual direction.')
  }),
  z.object({
    kind: z.literal('update_site_styles'),
    changes: styleChangesSchema,
    restyleControls: restyleSchema.optional(),
    reason: z.string().max(240).default('Updated the site styling.')
  }),
  z.object({
    kind: z.literal('add_block'),
    type: blockTypeSchema,
    paletteId: z.string().max(80).optional(),
    props: propsSchema.optional(),
    at: z
      .object({
        position: z.enum(['before', 'after', 'inside-start', 'inside-end', 'page-end']),
        ref: targetSchema.optional()
      })
      .optional(),
    reason: z.string().max(240).default('Added the requested control.')
  }),
  z.object({
    kind: z.literal('update_block'),
    target: targetSchema.default('selected'),
    props: propsSchema,
    reason: z.string().max(240).default('Updated the requested control.')
  }),
  z.object({
    kind: z.literal('delete_block'),
    target: targetSchema.default('selected'),
    reason: z.string().max(240).default('Removed the selected control.')
  })
])

const planSchema = z.object({
  reply: z.string().min(1).max(500),
  operations: z.array(operationSchema).max(8)
})

const contextSchema = z.object({
  page: z.string().max(120),
  theme: z.object({
    id: z.string().max(80),
    accent: z.string().max(80),
    background: z.string().max(80),
    text: z.string().max(80),
    swatches: z.array(z.string().max(80)).max(8),
    headingFamily: z.string().max(160),
    bodyFamily: z.string().max(160),
    headingSize: z.number(),
    bodySize: z.number(),
    buttonShape: z.string().max(40),
    spacing: z.string().max(40)
  }),
  outline: z
    .array(
      z.object({
        ref: z.string().max(16),
        type: blockTypeSchema,
        label: z.string().max(60).optional(),
        depth: z.number().min(0).max(6),
        parentRef: z.string().max(16).optional(),
        background: z.string().max(80).optional()
      })
    )
    .max(80),
  selected: z
    .object({
      ref: z.string().max(16),
      type: blockTypeSchema,
      props: z.record(z.string().max(60), z.unknown())
    })
    .nullable()
})

const inputSchema = z.object({
  prompt: z.string().trim().min(1).max(1200),
  context: contextSchema
})

const THEME_IDS = SITE_THEME_PRESETS.map(preset => preset.id).join(', ')

const ADD_INTENT_PATTERN = /\b(add|insert|include|put|place|create|append|new)\b/i
const REDESIGN_INTENT_PATTERN = /\b(redesign|restyle|revamp|refresh|overhaul|rebrand|whole page|entire page)\b/i

/** Types most likely needed for an insertion when the request names no specific control. */
const DEFAULT_INSERT_TYPES: BlockType[] = ['heading', 'text', 'button']

const MAX_SCOPED_TYPES = 6

function scopeTypes(prompt: string, context: AiBuilderContext): BlockType[] {
  const types = relevantControlTypes(context)

  if (ADD_INTENT_PATTERN.test(prompt)) {
    const requested = getRequestedAiBuilderBlocks(prompt).map(entry => entry.type)

    types.push(...(requested.length > 0 ? requested : DEFAULT_INSERT_TYPES))
  }

  if (types.length === 0) {
    types.push(...DEFAULT_INSERT_TYPES)
  }

  return Array.from(new Set(types)).slice(0, MAX_SCOPED_TYPES)
}

function describePalettes(types: BlockType[]): string {
  return types
    .map(type => {
      const variants = PALETTE_ITEMS.filter(item => item.type === type)

      return variants.length > 1 ? `${type}: ${variants.map(item => `${item.id} (${item.label})`).join(', ')}` : null
    })
    .filter(Boolean)
    .join('\n')
}

function createSystemPrompt(prompt: string, context: AiBuilderContext) {
  const types = scopeTypes(prompt, context)
  const palettes = ADD_INTENT_PATTERN.test(prompt) ? describePalettes(types) : ''

  return `You are the design planner for a visual website builder. Return JSON only:
{"reply":"one short sentence for the user","operations":[…]}

Controls are addressed by the short refs in the page outline, or by "selected", "first", "last".
Never invent refs. "this", "it", and "here" mean the selected control.

Operations:
- update_block {target, props}: set control properties. Only use property names listed in CAPABILITIES for that control's type, and only values inside the stated range or enum. Dotted names such as typography.fontSize are valid.
- add_block {type, paletteId?, props?, at?}: insert a control. at.position is before | after | inside-start | inside-end | page-end and at.ref names the control it is relative to. Use inside-* only for section, carousel, and tabs. Set props to write real copy instead of leaving placeholder text.
- delete_block {target}
- apply_theme {themeId, restyleControls}: themeId is one of ${THEME_IDS}.
- update_site_styles {changes, restyleControls}: page-wide colors, fonts, buttons, forms, spacing.

restyleControls controls how far a theme change reaches: "match" (default) also repaints controls still using the old palette, "rebuild" repaints every control and is only for an explicit redesign, "none" changes the page shell alone.

Design rules:
- Derive colors from the active theme. Reuse theme.accent, theme.text, theme.background, or a swatch rather than inventing an unrelated hue.
- Keep contrast readable: light text on dark surfaces, dark text on light surfaces.
- When inserting text near an existing control, match that control's alignment and use a size below its heading size so the hierarchy still reads.
- Prefer one or two precise operations over many. Never restate a value that is already set.

CAPABILITIES
${describeControlCapabilities(types)}${palettes ? `\n\nPALETTE VARIANTS\n${palettes}` : ''}`
}

function createUserPrompt(prompt: string, context: AiBuilderContext) {
  const selected = context.selected
    ? `SELECTED ${context.selected.ref} ${context.selected.type}\n${JSON.stringify(context.selected.props)}`
    : 'SELECTED none — the request is page-level unless it names a control.'

  return `REQUEST
${prompt}

PAGE ${context.page}
THEME ${JSON.stringify(context.theme)}

OUTLINE
${describePageOutline(context.outline)}

${selected}${REDESIGN_INTENT_PATTERN.test(prompt) ? '\n\nThe user asked for a redesign, so prefer restyleControls "rebuild".' : ''}`
}

export async function planAiBuilderCommandAction(input: unknown): Promise<
  { success: true; plan: AiBuilderPlan; usedOpenAi: boolean } | { success: false; error: string }
> {
  const parsed = inputSchema.safeParse(input)

  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in with an organization.' }
    }

    if (!parsed.success) {
      return { success: false, error: 'That request is too long or contains invalid builder context.' }
    }

    const { prompt, context } = parsed.data
    const fallback = createLocalAiBuilderPlan(prompt, context).plan

    if (!isOpenAiConfigured()) {
      return { success: true, plan: fallback, usedOpenAi: false }
    }

    const result = await createJsonCompletion<unknown>({
      system: createSystemPrompt(prompt, context),
      user: createUserPrompt(prompt, context),
      model: getOpenAiModel(),
      temperature: 0.2,
      timeoutMs: 15_000
    })

    const validated = planSchema.safeParse(result)

    if (!validated.success || validated.data.operations.length === 0) {
      return { success: true, plan: fallback, usedOpenAi: false }
    }

    return { success: true, plan: validated.data, usedOpenAi: true }
  } catch (error) {
    if (parsed.success) {
      return {
        success: true,
        plan: createLocalAiBuilderPlan(parsed.data.prompt, parsed.data.context).plan,
        usedOpenAi: false
      }
    }

    return { success: false, error: formatActionError(error, 'The AI planner could not complete that change.') }
  }
}
