import { alpha } from '@mui/material/styles'

import {
  DEFAULT_PRICING_PLANS,
  PRICING_MAX_FEATURES,
  PRICING_MAX_PLANS
} from '../constants/pricingLayout'
import type {
  PricingBlockProps,
  PricingCardShadow,
  PricingCardStyle,
  PricingFeature,
  PricingInterval,
  PricingPlan
} from '../types'

export const PRICING_MAX_WIDTH_MAP = {
  sm: 640,
  md: 768,
  lg: 1180,
  full: '100%'
} as const

export function clonePricingPlans(plans: PricingPlan[] | undefined, createId: () => string): PricingPlan[] {
  return (plans ?? []).map(plan => ({
    ...plan,
    id: createId(),
    features: (plan.features ?? []).map(feature => ({ ...feature, id: createId() }))
  }))
}

export function createPricingFeature(id: string, index = 0): PricingFeature {
  return {
    id,
    text: `Feature ${index + 1}`,
    state: 'included',
    hint: ''
  }
}

export function createPricingPlan(id: string, index = 0, createId: () => string): PricingPlan {
  const template = DEFAULT_PRICING_PLANS[index % DEFAULT_PRICING_PLANS.length]

  return {
    ...template,
    id,
    name: index < DEFAULT_PRICING_PLANS.length ? template.name : `Plan ${index + 1}`,
    recommended: false,
    badge: '',
    cardBackground: '',
    features: template.features.map(feature => ({ ...feature, id: createId() }))
  }
}

export function updatePricingPlan(
  plans: PricingPlan[],
  planId: string,
  changes: Partial<PricingPlan>
): PricingPlan[] {
  const nextRecommended = Boolean(changes.recommended)

  return plans.map(plan => {
    if (plan.id === planId) {
      return { ...plan, ...changes }
    }

    if (nextRecommended) {
      return { ...plan, recommended: false }
    }

    return plan
  })
}

export function updatePlanFeature(
  plans: PricingPlan[],
  planId: string,
  featureId: string,
  changes: Partial<PricingFeature>
): PricingPlan[] {
  return plans.map(plan => {
    if (plan.id !== planId) {
      return plan
    }

    return {
      ...plan,
      features: plan.features.map(feature => (feature.id === featureId ? { ...feature, ...changes } : feature))
    }
  })
}

export function addPlanFeature(plans: PricingPlan[], planId: string, feature: PricingFeature): PricingPlan[] {
  return plans.map(plan => {
    if (plan.id !== planId || plan.features.length >= PRICING_MAX_FEATURES) {
      return plan
    }

    return { ...plan, features: [...plan.features, feature] }
  })
}

export function removePlanFeature(plans: PricingPlan[], planId: string, featureId: string): PricingPlan[] {
  return plans.map(plan => {
    if (plan.id !== planId || plan.features.length <= 1) {
      return plan
    }

    return { ...plan, features: plan.features.filter(feature => feature.id !== featureId) }
  })
}

export function canAddPricingPlan(plans: PricingPlan[]): boolean {
  return plans.length < PRICING_MAX_PLANS
}

export function isCustomPricedPlan(plan: PricingPlan): boolean {
  return Boolean(plan.customPriceLabel?.trim())
}

export function getPlanPrice(plan: PricingPlan, interval: PricingInterval): number {
  if (interval === 'annual') {
    return plan.annualMonthlyPrice > 0 ? plan.annualMonthlyPrice : plan.monthlyPrice
  }

  return plan.monthlyPrice
}

export function getYearlyTotal(plan: PricingPlan): number {
  const monthly = getPlanPrice(plan, 'annual')

  return monthly * 12
}

export function formatPlanPrice(amount: number, currency = '$'): string {
  const symbol = currency.trim() || '$'
  const rounded = Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)

  return `${symbol}${rounded}`
}

export function getPlanDiscountLabel(plan: PricingPlan, interval: PricingInterval): string {
  if (interval !== 'annual') {
    return ''
  }

  if (plan.discountLabel?.trim()) {
    return plan.discountLabel.trim()
  }

  if (plan.discountPercent > 0) {
    return `Save ${plan.discountPercent}%`
  }

  return ''
}

export function collectComparisonFeatures(plans: PricingPlan[]): string[] {
  const seen = new Set<string>()
  const rows: string[] = []

  for (const plan of plans) {
    for (const feature of plan.features) {
      const text = feature.text.trim()

      if (!text || seen.has(text)) {
        continue
      }

      seen.add(text)
      rows.push(text)
    }
  }

  return rows
}

export function findPlanFeature(plan: PricingPlan, text: string): PricingFeature | undefined {
  return plan.features.find(feature => feature.text.trim() === text.trim())
}

export function ensurePricingPlans(plans: PricingPlan[] | undefined): PricingPlan[] {
  if (Array.isArray(plans) && plans.length > 0) {
    return plans
  }

  return DEFAULT_PRICING_PLANS.map(plan => ({
    ...plan,
    features: plan.features.map(feature => ({ ...feature }))
  }))
}

export function resolvePricingPlanFill(
  props: Pick<PricingBlockProps, 'cardBackground'>,
  plan?: Pick<PricingPlan, 'cardBackground'>
): string {
  return plan?.cardBackground?.trim() || props.cardBackground?.trim() || '#ffffff'
}

function pricingCardShadow(kind: PricingCardShadow, accent: string, featured: boolean): string {
  if (kind === 'none') {
    return featured ? `0 0 0 1px ${alpha(accent, 0.22)}` : 'none'
  }

  if (kind === 'soft') {
    return featured ? `0 12px 28px ${alpha(accent, 0.16)}` : '0 8px 22px rgba(15, 23, 42, 0.06)'
  }

  if (kind === 'strong') {
    return featured ? `0 28px 58px ${alpha(accent, 0.22)}` : '0 24px 52px rgba(15, 23, 42, 0.12)'
  }

  return featured ? `0 20px 44px ${alpha(accent, 0.18)}` : '0 16px 40px rgba(15, 23, 42, 0.08)'
}

export function getPricingCardSurfaceSx(options: {
  cardStyle: PricingCardStyle
  fill: string
  accent: string
  textColor: string
  featured: boolean
  borderColor?: string
  borderWidth: number
  shadow: PricingCardShadow
}): {
  backgroundColor: string
  backgroundImage?: string
  border: string
  boxShadow: string
  backdropFilter?: string
} {
  const { cardStyle, fill, accent, textColor, featured, borderColor, borderWidth, shadow } = options
  const line = borderColor?.trim() || (featured ? accent : textColor)
  const width = Math.max(0, borderWidth)
  const boxShadow = pricingCardShadow(shadow, accent, featured)

  if (cardStyle === 'outlined') {
    return {
      backgroundColor: fill,
      border: `${Math.max(width, 1)}px solid ${alpha(line, featured ? 0.7 : 0.2)}`,
      boxShadow: shadow === 'none' ? 'none' : boxShadow
    }
  }

  if (cardStyle === 'filled' || cardStyle === 'tinted') {
    const tint = cardStyle === 'filled' ? (featured ? 0.22 : 0.14) : featured ? 0.14 : 0.08

    return {
      backgroundColor: fill,
      backgroundImage: `linear-gradient(${alpha(accent, tint)}, ${alpha(accent, tint)})`,
      border: `${Math.max(width, 1)}px solid ${alpha(accent, featured ? 0.38 : 0.14)}`,
      boxShadow
    }
  }

  if (cardStyle === 'glass') {
    return {
      backgroundColor: alpha(fill, 0.52),
      border: `${Math.max(width, 1)}px solid ${alpha('#ffffff', 0.38)}`,
      backdropFilter: 'blur(18px)',
      boxShadow
    }
  }

  return {
    backgroundColor: fill,
    border: `${Math.max(width, 1)}px solid ${alpha(line, featured ? 0.24 : 0.08)}`,
    boxShadow
  }
}
