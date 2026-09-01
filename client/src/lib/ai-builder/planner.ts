import { PALETTE_ITEMS } from '@/features/your-space/constants'
import { SITE_THEME_PRESETS } from '@/features/your-space/constants/siteStylePresets'
import type { BlockType } from '@/features/your-space/types'

import { getControlProp } from './control-schema'
import type { AiBuilderContext, AiBuilderOperation, AiBuilderPlan } from './types'

/**
 * The local planner exists to answer unambiguous requests instantly and for
 * free. Anything qualitative ("make this feel premium", "add typography that
 * matches"), anything about placement, and anything needing new copy is left to
 * the model — a wrong-but-fast answer is worse than a slower right one.
 */
export type LocalPlanResult = {
  plan: AiBuilderPlan
  confidence: 'high' | 'low'
}

const COLOR_NAMES: Record<string, string> = {
  white: '#ffffff',
  black: '#111827',
  charcoal: '#1f2937',
  navy: '#0f172a',
  blue: '#2563eb',
  indigo: '#4f46e5',
  violet: '#7c3aed',
  purple: '#7c3aed',
  teal: '#0f766e',
  green: '#15803d',
  emerald: '#047857',
  orange: '#ea580c',
  amber: '#d97706',
  yellow: '#ca8a04',
  red: '#dc2626',
  crimson: '#be123c',
  rose: '#e11d48',
  pink: '#db2777',
  gold: '#a16207',
  cream: '#fffdf7',
  beige: '#f5f0e8',
  sand: '#e7dfd1',
  slate: '#475569'
}

const BLOCK_ALIASES: Array<{ words: string[]; type: BlockType; paletteId?: string; label: string }> = [
  { words: ['contact', 'form', 'inquiry', 'enquiry', 'message'], type: 'contactForm', label: 'contact form' },
  { words: ['booking', 'appointment', 'calendar'], type: 'serviceBooking', paletteId: 'service-booking', label: 'booking control' },
  { words: ['service', 'services'], type: 'serviceDirectory', paletteId: 'services-directory', label: 'services directory' },
  { words: ['pricing', 'plans', 'packages', 'price'], type: 'pricing', paletteId: 'pricing-cards', label: 'pricing cards' },
  { words: ['testimonial', 'testimonials', 'review', 'reviews'], type: 'text', paletteId: 'text-testimonial', label: 'testimonial' },
  { words: ['faq', 'faqs', 'questions'], type: 'tabs', paletteId: 'tabs-horizontal-pills', label: 'FAQ tabs' },
  { words: ['tab', 'tabs'], type: 'tabs', paletteId: 'tabs-horizontal-underline', label: 'tabs' },
  { words: ['carousel', 'slider', 'slides'], type: 'carousel', paletteId: 'carousel-slide', label: 'carousel' },
  { words: ['portfolio', 'gallery', 'showcase', 'work'], type: 'showcase', paletteId: 'showcase-cards', label: 'showcase cards' },
  { words: ['location', 'map', 'address'], type: 'location', label: 'location map' },
  { words: ['video', 'film'], type: 'video', label: 'video' },
  { words: ['photo', 'image', 'picture'], type: 'image', label: 'image' },
  { words: ['button', 'cta', 'call-to-action'], type: 'button', label: 'button' },
  { words: ['heading', 'headline', 'title'], type: 'heading', label: 'heading' },
  { words: ['typography', 'paragraph', 'copy', 'story', 'about', 'text'], type: 'text', label: 'paragraph' },
  { words: ['section', 'content block'], type: 'section', paletteId: 'section-single', label: 'section' }
]

const THEME_ALIASES: Record<string, string> = {
  clean: 'plain',
  plain: 'plain',
  neutral: 'professional',
  corporate: 'corporate',
  modern: 'modern',
  startup: 'startup',
  tech: 'startup',
  wellness: 'wellness',
  calm: 'wellness',
  creative: 'creative',
  agency: 'creative',
  luxury: 'luxury',
  premium: 'luxury',
  editorial: 'editorial',
  magazine: 'editorial',
  bold: 'bold',
  playful: 'playful',
  friendly: 'playful',
  elegant: 'elegant',
  minimal: 'minimal',
  monochrome: 'minimal',
  classic: 'classic'
}

/**
 * Words that mean the request needs judgement about placement, tone, or
 * matching the design — the model handles those far better than regexes.
 */
const NUANCE_PATTERN =
  /\b(nice|nicely|nicer|good|great|beautiful|pretty|clean|modern|premium|elegant|bold|playful|luxurious|professional|stylish|matching|match|harmon\w*|suit\w*|appropriate|context|redesign|revamp|refresh|improve|better|polish|balance\w*|under|underneath|above|below|beneath|before|after|inside|between|next to|top of|bottom of|first|last|instead|and also|then)\b/i

function normalized(prompt: string) {
  return prompt.toLowerCase().replace(/[^\w\s#-]/g, ' ')
}

function firstSupported(type: BlockType, keys: string[]): string | null {
  return keys.find(key => getControlProp(type, key)) ?? null
}

function findColor(prompt: string): string | null {
  const hex = prompt.match(/#[0-9a-f]{3,8}\b/i)?.[0]

  if (hex) {
    return hex
  }

  for (const word of normalized(prompt).split(/\s+/)) {
    if (COLOR_NAMES[word]) {
      return COLOR_NAMES[word]
    }
  }

  return null
}

function findTheme(prompt: string): { id: string; name: string } | null {
  const text = normalized(prompt)

  for (const [alias, id] of Object.entries(THEME_ALIASES)) {
    if (text.includes(alias)) {
      const preset = SITE_THEME_PRESETS.find(entry => entry.id === id)

      if (preset) {
        return { id, name: preset.name }
      }
    }
  }

  return null
}

function findBlockAlias(prompt: string) {
  const text = normalized(prompt)

  return BLOCK_ALIASES.find(alias => alias.words.some(word => text.includes(word))) ?? null
}

export function getRequestedAiBuilderBlocks(prompt: string) {
  const text = normalized(prompt)
  const seen = new Set<BlockType>()

  return BLOCK_ALIASES.filter(alias => alias.words.some(word => text.includes(word))).filter(alias => {
    if (seen.has(alias.type)) {
      return false
    }

    seen.add(alias.type)

    return true
  })
}

function high(reply: string, operations: AiBuilderOperation[]): LocalPlanResult {
  return { plan: { reply, operations }, confidence: 'high' }
}

function low(reply: string): LocalPlanResult {
  return { plan: { reply, operations: [] }, confidence: 'low' }
}

function selectedTarget(context: AiBuilderContext) {
  return context.selected?.ref ?? 'selected'
}

export function createLocalAiBuilderPlan(prompt: string, context: AiBuilderContext): LocalPlanResult {
  const text = normalized(prompt)
  const selected = context.selected
  const needsJudgement = NUANCE_PATTERN.test(prompt)

  const theme = findTheme(prompt)

  if (theme && /\b(theme|look|feel|direction|palette|switch|apply)\b/i.test(prompt) && !needsJudgement) {
    return high(`Switching the site to the ${theme.name.toLowerCase()} direction.`, [
      {
        kind: 'apply_theme',
        themeId: theme.id,
        restyleControls: 'match',
        reason: `${theme.name} matches the requested visual direction.`
      }
    ])
  }

  if (/\b(delete|remove|drop)\b/i.test(prompt) && selected && !needsJudgement) {
    return high(`Removed the selected ${selected.type} control.`, [
      { kind: 'delete_block', target: selectedTarget(context), reason: 'The request explicitly removes the selected control.' }
    ])
  }

  const opacity = text.match(/\b(?:opacity|transparency)\D{0,12}(\d{1,3})\s*%?/i)?.[1]

  if (opacity && selected) {
    const key =
      firstSupported(selected.type, text.includes('photo') ? ['backgroundPhotoOpacity'] : []) ??
      firstSupported(selected.type, ['opacity', 'backgroundOpacity'])

    if (key) {
      const value = Math.max(0, Math.min(100, Number(opacity)))

      return high(`Set the selected ${selected.type} ${key} to ${value}%.`, [
        {
          kind: 'update_block',
          target: selectedTarget(context),
          props: { [key]: value },
          reason: 'Opacity has an unambiguous numeric target.'
        }
      ])
    }
  }

  const color = findColor(prompt)

  if (color && selected && !needsJudgement) {
    const wantsText = /\b(text|font|foreground)\b/i.test(prompt)
    const wantsBackground = /\b(background|backdrop|surface|bg|fill)\b/i.test(prompt)

    const key = wantsText
      ? firstSupported(selected.type, ['textColor', 'color', 'activeTabColor'])
      : wantsBackground
        ? firstSupported(selected.type, ['background', 'backgroundColor', 'fillColor', 'tabBackgroundColor', 'cardBackground'])
        : null

    if (key) {
      return high(`Set the selected ${selected.type} ${key} to ${color}.`, [
        {
          kind: 'update_block',
          target: selectedTarget(context),
          props: { [key]: color },
          reason: 'The prompt names both an explicit color and which surface it belongs to.'
        }
      ])
    }
  }

  if (color && !selected && /\b(page|site)\b/i.test(prompt) && /\bbackground\b/i.test(prompt)) {
    return high(`Set the page background to ${color}.`, [
      {
        kind: 'update_site_styles',
        changes: { colors: { background: color } },
        reason: 'No control is selected and the request names the page background.'
      }
    ])
  }

  const alignment = text.match(/\b(left|center|right)\s*(?:aligned|alignment)?\b/)?.[1]

  if (alignment && selected && getControlProp(selected.type, 'alignment') && !needsJudgement) {
    return high(`Aligned the selected ${selected.type} ${alignment}.`, [
      {
        kind: 'update_block',
        target: selectedTarget(context),
        props: { alignment },
        reason: 'Alignment is an unambiguous enum on the selected control.'
      }
    ])
  }

  if (/\b(sharp|pill|rounded|round)\b/i.test(prompt) && /\bcorner|corners|radius\b/i.test(prompt) && selected) {
    const key = firstSupported(selected.type, [
      'borderRadius',
      'tabBorderRadius',
      'cardRadius',
      'iconBorderRadius',
      'mediaRadius'
    ])

    if (key) {
      const radius = /\bsharp\b/i.test(prompt) ? 0 : /\bpill\b/i.test(prompt) ? 999 : 20

      return high(`Updated the selected ${selected.type} corners.`, [
        {
          kind: 'update_block',
          target: selectedTarget(context),
          props: { [key]: radius },
          reason: 'Corner style maps directly to a numeric radius.'
        }
      ])
    }
  }

  const alias = findBlockAlias(prompt)

  const isSimpleAdd =
    /\b(add|insert|include|put|place)\b/i.test(prompt) && !needsJudgement && prompt.trim().split(/\s+/).length <= 6

  if (alias && isSimpleAdd) {
    const paletteItem = PALETTE_ITEMS.find(
      item => item.type === alias.type && (!alias.paletteId || item.id === alias.paletteId)
    )

    return high(`Added a ${alias.label}.`, [
      {
        kind: 'add_block',
        type: alias.type,
        ...(paletteItem ? { paletteId: paletteItem.id } : {}),
        reason: `The request names a ${alias.label} with no placement or styling nuance.`
      }
    ])
  }

  return low(
    selected
      ? `Thinking about the selected ${selected.type} control…`
      : 'Thinking about the best change for this page…'
  )
}
