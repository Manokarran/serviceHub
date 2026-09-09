import type {
  FaqBlockProps,
  FaqCardStyle,
  FaqExpandMode,
  FaqIconStyle,
  FaqItem,
  FaqLayout,
  PricingCardShadow,
  PricingEntranceAnimation
} from '../types'

type FaqOption<T extends string> = {
  value: T
  label: string
  icon: string
}

export const FAQ_MAX_ITEMS = 16

export const FAQ_LAYOUT_OPTIONS: FaqOption<FaqLayout>[] = [
  { value: 'stack', label: 'Stack', icon: 'ri-layout-row-line' },
  { value: 'split-header', label: 'Split', icon: 'ri-layout-left-line' }
]

export const FAQ_CARD_STYLE_OPTIONS: FaqOption<FaqCardStyle>[] = [
  { value: 'elevated', label: 'Elevated', icon: 'ri-stack-line' },
  { value: 'outlined', label: 'Outlined', icon: 'ri-checkbox-blank-line' },
  { value: 'filled', label: 'Filled', icon: 'ri-checkbox-blank-fill' },
  { value: 'glass', label: 'Glass', icon: 'ri-blur-off-line' }
]

export const FAQ_EXPAND_OPTIONS: FaqOption<FaqExpandMode>[] = [
  { value: 'single', label: 'One open', icon: 'ri-menu-fold-line' },
  { value: 'multiple', label: 'Many open', icon: 'ri-menu-unfold-line' }
]

export const FAQ_ICON_OPTIONS: FaqOption<FaqIconStyle>[] = [
  { value: 'chevron', label: 'Chevron', icon: 'ri-arrow-down-s-line' },
  { value: 'plus', label: 'Plus', icon: 'ri-add-line' },
  { value: 'caret', label: 'Caret', icon: 'ri-arrow-down-s-fill' }
]

export const FAQ_SHADOW_OPTIONS: FaqOption<PricingCardShadow>[] = [
  { value: 'none', label: 'None', icon: 'ri-forbid-line' },
  { value: 'soft', label: 'Soft', icon: 'ri-checkbox-blank-line' },
  { value: 'medium', label: 'Medium', icon: 'ri-shadow-line' },
  { value: 'strong', label: 'Strong', icon: 'ri-stack-line' }
]

export const FAQ_ENTRANCE_OPTIONS: FaqOption<PricingEntranceAnimation>[] = [
  { value: 'none', label: 'None', icon: 'ri-forbid-line' },
  { value: 'fade-in', label: 'Fade in', icon: 'ri-contrast-2-line' },
  { value: 'slide-up', label: 'Slide up', icon: 'ri-arrow-up-s-line' }
]

function item(id: string, question: string, answer: string): FaqItem {
  return { id, question, answer }
}

export const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  item(
    'faq-1',
    'What is included?',
    'Everything you need to launch — pages, booking tools, contact forms, and a polished design you can edit anytime.'
  ),
  item(
    'faq-2',
    'How does pricing work?',
    'Choose a plan that fits today, then upgrade when you need more seats, pages, or support. You can switch monthly or annual billing anytime.'
  ),
  item(
    'faq-3',
    'Can I cancel anytime?',
    'Yes. There are no long-term contracts. Cancel from your account settings and keep access until the end of your billing period.'
  ),
  item(
    'faq-4',
    'Do I need technical skills?',
    'No. Drag blocks, edit text inline, and publish when you are ready. Custom domains and SSL are included.'
  ),
  item(
    'faq-5',
    'Will it look good on mobile?',
    'Yes. Every section is built to stack cleanly on phones and tablets, with readable type and comfortable tap targets.'
  )
]

const FAQ_SHARED_PROPS: Omit<FaqBlockProps, 'layout' | 'cardStyle'> = {
  eyebrow: 'FAQ',
  title: 'Frequently Asked Questions',
  subtitle: 'Everything you need to know before you get started.',
  alignment: 'center',
  expandMode: 'single',
  defaultOpenFirst: false,
  iconStyle: 'chevron',
  items: DEFAULT_FAQ_ITEMS,
  paddingY: 80,
  paddingX: 32,
  maxWidth: 'md',
  gap: 12,
  cardRadius: 16,
  textColor: '#0f172a',
  accentColor: '',
  cardBackground: '#ffffff',
  cardBorderColor: '',
  cardBorderWidth: 1,
  cardShadow: 'soft',
  titleStyle: 'gradient',
  entranceAnimation: 'slide-up',
  background: 'transparent',
  backgroundType: 'color',
  backgroundOpacity: 0,
  splitVisualAnimation: 'static',
  splitVisualColorStart: '',
  splitVisualColorEnd: ''
}

export function createFaqDefaultProps(
  overrides: Pick<FaqBlockProps, 'layout' | 'cardStyle'> & Partial<FaqBlockProps>
): FaqBlockProps {
  const items = (overrides.items ?? FAQ_SHARED_PROPS.items).map(entry => ({ ...entry }))

  return {
    ...FAQ_SHARED_PROPS,
    ...overrides,
    cardStyle: overrides.cardStyle ?? 'glass',
    items
  }
}
