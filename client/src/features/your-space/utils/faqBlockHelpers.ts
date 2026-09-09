import {
  DEFAULT_FAQ_ITEMS,
  FAQ_MAX_ITEMS
} from '../constants/faqLayout'
import type { FaqBlockProps, FaqItem } from '../types'
import { getPricingCardSurfaceSx } from './pricingBlockHelpers'
import type { PricingCardStyle } from '../types'

export const FAQ_MAX_WIDTH_MAP = {
  sm: 640,
  md: 768,
  lg: 960,
  full: '100%'
} as const

export function cloneFaqItems(items: FaqItem[] | undefined, createId: () => string): FaqItem[] {
  return (items ?? []).map(item => ({
    ...item,
    id: createId()
  }))
}

export function createFaqItem(id: string, index = 0): FaqItem {
  const template = DEFAULT_FAQ_ITEMS[index % DEFAULT_FAQ_ITEMS.length]

  return {
    id,
    question: index < DEFAULT_FAQ_ITEMS.length ? template.question : `Question ${index + 1}?`,
    answer:
      index < DEFAULT_FAQ_ITEMS.length
        ? template.answer
        : 'Add a clear, helpful answer visitors can scan in a few seconds.'
  }
}

export function updateFaqItem(
  items: FaqItem[],
  itemId: string,
  changes: Partial<FaqItem>
): FaqItem[] {
  return items.map(item => (item.id === itemId ? { ...item, ...changes } : item))
}

export function canAddFaqItem(items: FaqItem[]): boolean {
  return items.length < FAQ_MAX_ITEMS
}

export function ensureFaqItems(items: FaqItem[] | undefined): FaqItem[] {
  if (Array.isArray(items) && items.length > 0) {
    return items
  }

  return DEFAULT_FAQ_ITEMS.map(item => ({ ...item }))
}

export function resolveFaqCardFill(props: Pick<FaqBlockProps, 'cardBackground'>): string {
  return props.cardBackground?.trim() || '#ffffff'
}

/** Map FAQ card styles onto the shared pricing surface helper. */
export function getFaqCardSurfaceSx(options: {
  cardStyle: FaqBlockProps['cardStyle']
  fill: string
  accent: string
  textColor: string
  borderColor?: string
  borderWidth: number
  shadow: FaqBlockProps['cardShadow']
}) {
  const cardStyle = (options.cardStyle === 'glass'
    ? 'glass'
    : options.cardStyle === 'outlined'
      ? 'outlined'
      : options.cardStyle === 'filled'
        ? 'filled'
        : 'elevated') as PricingCardStyle

  return getPricingCardSurfaceSx({
    cardStyle,
    fill: options.fill,
    accent: options.accent,
    textColor: options.textColor,
    featured: false,
    borderColor: options.borderColor,
    borderWidth: options.borderWidth,
    shadow: options.shadow
  })
}

export function getFaqExpandIcon(style: FaqBlockProps['iconStyle'], open: boolean): string {
  if (style === 'plus') {
    return open ? 'ri-subtract-line' : 'ri-add-line'
  }

  if (style === 'caret') {
    return 'ri-arrow-down-s-fill'
  }

  return 'ri-arrow-down-s-line'
}
