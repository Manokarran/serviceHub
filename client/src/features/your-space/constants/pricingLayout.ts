import type {
  PricingBlockProps,
  PricingCardShadow,
  PricingCardStyle,
  PricingColumns,
  PricingEntranceAnimation,
  PricingFeature,
  PricingFeatureIconStyle,
  PricingHoverEffect,
  PricingInterval,
  PricingLayout,
  PricingPlan
} from '../types'

type PricingOption<T extends string> = {
  value: T
  label: string
  icon: string
}

export const PRICING_MAX_PLANS = 8
export const PRICING_MAX_FEATURES = 16

export const PRICING_LAYOUT_OPTIONS: PricingOption<PricingLayout>[] = [
  { value: 'cards', label: 'Cards', icon: 'ri-layout-grid-line' },
  { value: 'comparison', label: 'Compare', icon: 'ri-table-line' },
  { value: 'stack', label: 'Stack', icon: 'ri-layout-row-line' }
]

export const PRICING_COLUMN_OPTIONS: PricingOption<`${PricingColumns}`>[] = [
  { value: '2', label: '2', icon: 'ri-layout-column-line' },
  { value: '3', label: '3', icon: 'ri-layout-grid-line' },
  { value: '4', label: '4', icon: 'ri-grid-line' }
]

export const PRICING_CARD_STYLE_OPTIONS: PricingOption<PricingCardStyle>[] = [
  { value: 'elevated', label: 'Elevated', icon: 'ri-stack-line' },
  { value: 'outlined', label: 'Outlined', icon: 'ri-checkbox-blank-line' },
  { value: 'filled', label: 'Filled', icon: 'ri-checkbox-blank-fill' },
  { value: 'tinted', label: 'Tinted', icon: 'ri-contrast-drop-2-line' },
  { value: 'glass', label: 'Glass', icon: 'ri-blur-off-line' }
]

export const PRICING_SHADOW_OPTIONS: PricingOption<PricingCardShadow>[] = [
  { value: 'none', label: 'None', icon: 'ri-forbid-line' },
  { value: 'soft', label: 'Soft', icon: 'ri-checkbox-blank-line' },
  { value: 'medium', label: 'Medium', icon: 'ri-shadow-line' },
  { value: 'strong', label: 'Strong', icon: 'ri-stack-line' }
]

export const PRICING_HOVER_OPTIONS: PricingOption<PricingHoverEffect>[] = [
  { value: 'none', label: 'None', icon: 'ri-forbid-line' },
  { value: 'lift', label: 'Lift', icon: 'ri-arrow-up-line' },
  { value: 'glow', label: 'Glow', icon: 'ri-sparkling-line' }
]

export const PRICING_ENTRANCE_OPTIONS: PricingOption<PricingEntranceAnimation>[] = [
  { value: 'none', label: 'None', icon: 'ri-forbid-line' },
  { value: 'fade-in', label: 'Fade in', icon: 'ri-contrast-2-line' },
  { value: 'slide-up', label: 'Slide up', icon: 'ri-arrow-up-s-line' }
]

export const PRICING_FEATURE_ICON_OPTIONS: PricingOption<PricingFeatureIconStyle>[] = [
  { value: 'check', label: 'Checks', icon: 'ri-check-line' },
  { value: 'dot', label: 'Dots', icon: 'ri-circle-fill' },
  { value: 'none', label: 'None', icon: 'ri-text' }
]

export const PRICING_INTERVAL_OPTIONS: PricingOption<PricingInterval>[] = [
  { value: 'monthly', label: 'Monthly', icon: 'ri-calendar-line' },
  { value: 'annual', label: 'Annual', icon: 'ri-calendar-2-line' }
]

function feature(id: string, text: string, state: PricingFeature['state'] = 'included', hint = ''): PricingFeature {
  return { id, text, state, hint }
}

export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'pricing-plan-starter',
    name: 'Starter',
    description: 'Everything you need to launch a polished site and start taking enquiries.',
    badge: '',
    recommended: false,
    monthlyPrice: 29,
    annualMonthlyPrice: 24,
    customPriceLabel: '',
    currency: '$',
    discountPercent: 17,
    discountLabel: 'Save 17%',
    features: [
      feature('s1', '1 published website'),
      feature('s2', '5 team seats'),
      feature('s3', 'Contact form & lead inbox'),
      feature('s4', 'Essential blocks & templates'),
      feature('s5', 'SSL and custom domain'),
      feature('s6', 'Email support', 'limited', 'Replies in 2 business days'),
      feature('s7', 'Remove branding', 'excluded'),
      feature('s8', 'Priority onboarding', 'excluded')
    ],
    ctaText: 'Start free trial',
    ctaLink: '#',
    accentColor: '',
    cardBackground: ''
  },
  {
    id: 'pricing-plan-pro',
    name: 'Professional',
    description: 'For growing teams that want more pages, richer design, and a recommended public plan.',
    badge: 'Most popular',
    recommended: true,
    monthlyPrice: 79,
    annualMonthlyPrice: 63,
    customPriceLabel: '',
    currency: '$',
    discountPercent: 20,
    discountLabel: 'Save 20%',
    features: [
      feature('p1', 'Unlimited published pages'),
      feature('p2', '15 team seats'),
      feature('p3', 'Contact form & lead inbox'),
      feature('p4', 'Full block library & animations'),
      feature('p5', 'SSL and custom domain'),
      feature('p6', 'Priority email support'),
      feature('p7', 'Remove branding'),
      feature('p8', 'Monthly design review', 'limited', 'One session per month')
    ],
    ctaText: 'Choose Professional',
    ctaLink: '#',
    accentColor: '',
    cardBackground: ''
  },
  {
    id: 'pricing-plan-enterprise',
    name: 'Enterprise',
    description: 'Custom limits, onboarding, and a dedicated partner for organisations that need more.',
    badge: 'Best for teams',
    recommended: false,
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    customPriceLabel: "Let's talk",
    currency: '$',
    discountPercent: 0,
    discountLabel: '',
    features: [
      feature('e1', 'Unlimited sites and pages'),
      feature('e2', 'Unlimited seats'),
      feature('e3', 'Advanced forms & routing'),
      feature('e4', 'Custom blocks and brand kit'),
      feature('e5', 'SSO and security review'),
      feature('e6', 'Dedicated success manager'),
      feature('e7', 'Remove branding'),
      feature('e8', 'Priority onboarding')
    ],
    ctaText: 'Contact sales',
    ctaLink: 'contact',
    accentColor: '',
    cardBackground: ''
  }
]

export const SIMPLE_PRICING_PLANS: PricingPlan[] = [
  {
    ...DEFAULT_PRICING_PLANS[0],
    id: 'pricing-plan-basic',
    name: 'Basic',
    description: 'A clear monthly plan for independent operators.',
    monthlyPrice: 19,
    annualMonthlyPrice: 19,
    discountPercent: 0,
    discountLabel: '',
    features: DEFAULT_PRICING_PLANS[0].features.slice(0, 5)
  },
  {
    ...DEFAULT_PRICING_PLANS[1],
    id: 'pricing-plan-plus',
    name: 'Plus',
    description: 'More room to grow, with the features most teams actually use.',
    badge: 'Recommended',
    monthlyPrice: 49,
    annualMonthlyPrice: 49,
    discountPercent: 0,
    discountLabel: '',
    features: DEFAULT_PRICING_PLANS[1].features.slice(0, 6)
  }
]

const PRICING_SHARED_PROPS: Omit<PricingBlockProps, 'layout' | 'columns' | 'cardStyle'> = {
  eyebrow: 'Pricing',
  title: 'Plans that grow with you',
  subtitle: 'Start simple, then upgrade when you need more pages, seats, or support. Switch yearly billing to lock in the discount.',
  alignment: 'center',
  showIntervalToggle: true,
  defaultInterval: 'monthly',
  monthlyLabel: 'Monthly',
  annualLabel: 'Annual',
  annualBadge: '2 months free',
  currency: '$',
  showYearlyTotal: true,
  plans: DEFAULT_PRICING_PLANS,
  paddingY: 80,
  paddingX: 32,
  maxWidth: 'lg',
  gap: 24,
  cardRadius: 20,
  textColor: '#0f172a',
  accentColor: '',
  cardBackground: '#ffffff',
  cardBorderColor: '',
  cardBorderWidth: 1,
  cardShadow: 'medium',
  recommendedScale: true,
  buttonStyle: 'theme',
  titleStyle: 'solid',
  hoverEffect: 'lift',
  entranceAnimation: 'slide-up',
  recommendedGlow: true,
  featureIconStyle: 'check',
  background: 'transparent',
  backgroundType: 'color',
  backgroundOpacity: 0,
  splitVisualAnimation: 'static',
  splitVisualColorStart: '',
  splitVisualColorEnd: ''
}

export function createPricingDefaultProps(
  overrides: Pick<PricingBlockProps, 'layout' | 'columns' | 'cardStyle'> & Partial<PricingBlockProps>
): PricingBlockProps {
  const plans = (overrides.plans ?? PRICING_SHARED_PROPS.plans).map(plan => ({
    ...plan,
    features: plan.features.map(entry => ({ ...entry }))
  }))

  return {
    ...PRICING_SHARED_PROPS,
    ...overrides,
    plans
  }
}
