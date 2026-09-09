import type {
  Block,
  BlockBackgroundProps,
  CarouselBlockProps,
  FooterBlockProps,
  HeaderBlockProps,
  HeroBlockProps,
  ImageBlockProps,
  LogoBlockProps,
  SectionBlockProps,
  ShapeBlockProps,
  IconBlockProps,
  ContactFormBlockProps,
  SplitVisualConfig,
  TabsBlockProps,
  ShowcaseBlockProps,
  ShowcaseItem,
  PricingBlockProps,
  PricingPlan,
  FaqBlockProps,
  FaqItem,
  NavLinkItem,
  VideoBlockProps,
  TextBlockProps,
  HeadingBlockProps,
  ServiceDirectoryBlockProps,
  ServiceBookingBlockProps,
  CustomerBookingsBlockProps,
  LocationBlockProps
} from '../types'
import { createBlockId } from './blockFactory'
import { DEFAULT_SHAPE_PROPS } from '../constants/shapeBlock'
import { inferCarouselStylePreset } from '../constants/carouselStyle'
import { DEFAULT_ICON_BLOCK_PROPS } from '../constants/iconBlock'
import { DEFAULT_LOGO_ICON_STYLE } from '@/components/iconPickerStyle'
import {
  DEFAULT_SECTION_STYLE,
  isPhotoBackground,
  isVideoBackground,
  isValidMediaUrl,
  normalizeStoredMediaUrl,
  parseMediaUrl
} from './sectionStyleHelpers'
import { DEFAULT_SHOWCASE_ITEMS } from '../constants/showcaseLayout'
import { DEFAULT_PRICING_PLANS, createPricingDefaultProps } from '../constants/pricingLayout'
import { DEFAULT_FAQ_ITEMS, createFaqDefaultProps } from '../constants/faqLayout'

export function normalizeNavLinks(links: unknown): NavLinkItem[] {
  if (!Array.isArray(links)) {
    return []
  }

  const normalizeNavItem = (link: unknown): NavLinkItem | null => {
    if (typeof link === 'string') {
      const label = link.trim()

      return label ? { label, href: `#${label.toLowerCase().replace(/\s+/g, '-')}` } : null
    }

    if (link && typeof link === 'object' && !Array.isArray(link) && 'label' in link) {
      const item = link as NavLinkItem & { children?: unknown }
      const label = item.label?.trim()

      if (!label) {
        return null
      }

      const children = Array.isArray(item.children)
        ? item.children.map(child => normalizeNavItem(child)).filter((child): child is NavLinkItem => child !== null)
        : []

      return {
        label,
        href: item.href?.trim() || '#',
        ...(children.length > 0 ? { children } : {})
      }
    }

    return null
  }

  return links.map(link => normalizeNavItem(link)).filter((link): link is NavLinkItem => link !== null)
}

function normalizeChromeBackgroundProps(
  props: BlockBackgroundProps & SplitVisualConfig & { backgroundColor: string },
  defaults: { backgroundColor: string; backgroundOpacity: number }
): Pick<
  BlockBackgroundProps & SplitVisualConfig,
  | 'background'
  | 'backgroundType'
  | 'backgroundPhotoOpacity'
  | 'backgroundOpacity'
  | 'splitVisualAnimation'
  | 'splitVisualColorStart'
  | 'splitVisualColorEnd'
> {
  let backgroundType = props.backgroundType ?? 'color'
  let background = normalizeStoredMediaUrl(
    props.background ?? props.backgroundColor ?? defaults.backgroundColor,
    backgroundType
  )

  if (
    (backgroundType === 'photo' || backgroundType === 'video') &&
    !isValidMediaUrl(parseMediaUrl(background) ?? background)
  ) {
    backgroundType = 'color'
  }

  return {
    background,
    backgroundType,
    backgroundPhotoOpacity: props.backgroundPhotoOpacity ?? 100,
    backgroundOpacity: props.backgroundOpacity ?? defaults.backgroundOpacity,
    splitVisualAnimation: props.splitVisualAnimation ?? 'static',
    splitVisualColorStart: props.splitVisualColorStart ?? '',
    splitVisualColorEnd: props.splitVisualColorEnd ?? ''
  }
}

export function normalizeBlock(block: Block): Block {
  if (block.type === 'header') {
    const props = block.props as HeaderBlockProps

    return {
      ...block,
      props: {
        ...props,
        logoUrl: props.logoUrl ?? '',
        logoIcon: props.logoIcon ?? '',
        logoIconSize: props.logoIconSize ?? DEFAULT_LOGO_ICON_STYLE.size,
        logoIconShowBackground: props.logoIconShowBackground ?? DEFAULT_LOGO_ICON_STYLE.showBackground,
        logoIconBackgroundColor: props.logoIconBackgroundColor ?? DEFAULT_LOGO_ICON_STYLE.backgroundColor,
        logoIconBorderRadius: props.logoIconBorderRadius ?? DEFAULT_LOGO_ICON_STYLE.borderRadius,
        logoPosition: props.logoPosition ?? 'left',
        layout: props.layout ?? 'horizontal',
        fixed: props.fixed ?? false,
        borderRadius: props.borderRadius ?? 0,
        navLinks: normalizeNavLinks(props.navLinks),
        ...normalizeChromeBackgroundProps(props, {
          backgroundColor: props.backgroundColor ?? '#ffffff',
          backgroundOpacity: 0
        })
      }
    }
  }

  if (block.type === 'footer') {
    const props = block.props as FooterBlockProps

    return {
      ...block,
      props: {
        ...props,
        logoUrl: props.logoUrl ?? '',
        logoIcon: props.logoIcon ?? '',
        logoIconSize: props.logoIconSize ?? DEFAULT_LOGO_ICON_STYLE.size,
        logoIconShowBackground: props.logoIconShowBackground ?? DEFAULT_LOGO_ICON_STYLE.showBackground,
        logoIconBackgroundColor: props.logoIconBackgroundColor ?? DEFAULT_LOGO_ICON_STYLE.backgroundColor,
        logoIconBorderRadius: props.logoIconBorderRadius ?? DEFAULT_LOGO_ICON_STYLE.borderRadius,
        logoPosition: props.logoPosition ?? 'left',
        copyrightText: props.copyrightText ?? '© Your Brand. All rights reserved.',
        layout: props.layout ?? 'horizontal',
        fixed: props.fixed ?? false,
        borderRadius: props.borderRadius ?? 0,
        navLinks: normalizeNavLinks(props.navLinks),
        ...normalizeChromeBackgroundProps(props, {
          backgroundColor: props.backgroundColor ?? '#1a1a2e',
          backgroundOpacity: 100
        })
      }
    }
  }

  if (block.type === 'hero') {
    const props = block.props as HeroBlockProps
    let backgroundType = props.backgroundType ?? 'color'
    let background = normalizeStoredMediaUrl(props.background ?? props.backgroundColor ?? '#6366f1', backgroundType)

    if (
      (backgroundType === 'photo' || backgroundType === 'video') &&
      !isValidMediaUrl(parseMediaUrl(background) ?? background)
    ) {
      backgroundType = 'color'
    }

    return {
      ...block,
      props: {
        ...props,
        background,
        backgroundType,
        backgroundPhotoOpacity: props.backgroundPhotoOpacity ?? 100,
        backgroundOpacity: props.backgroundOpacity ?? 0,
        layout: props.layout ?? 'centered',
        verticalAlign: props.verticalAlign ?? 'center',
        contentMaxWidth: props.contentMaxWidth ?? 'lg',
        contentPaddingX: props.contentPaddingX ?? 32,
        contentPaddingY: props.contentPaddingY ?? 64,
        splitRatio: props.splitRatio ?? 50,
        titleStyle: props.titleStyle ?? 'gradient',
        contentSurface: props.contentSurface ?? 'none',
        mediaOverlay: props.mediaOverlay ?? 'gradient',
        eyebrow: props.eyebrow ?? '',
        secondaryButtonText: props.secondaryButtonText ?? '',
        secondaryButtonLink: props.secondaryButtonLink ?? '#',
        splitVisualAnimation: props.splitVisualAnimation ?? 'aurora',
        splitVisualColorStart: props.splitVisualColorStart ?? '',
        splitVisualColorEnd: props.splitVisualColorEnd ?? '',
        buttonStyle: props.buttonStyle ?? 'theme'
      }
    }
  }

  if (block.type === 'image') {
    const props = block.props as ImageBlockProps

    return {
      ...block,
      props: {
        ...props,
        src: props.src ?? '',
        alt: props.alt ?? 'Image',
        alignment: props.alignment ?? 'center',
        opacity: props.opacity ?? 100,
        crop: props.crop ?? null,
        adjustments: props.adjustments ?? null,
        deliveryQuality: props.deliveryQuality ?? 'optimized'
      }
    }
  }

  if (block.type === 'video') {
    const props = block.props as VideoBlockProps

    return {
      ...block,
      props: {
        ...props,
        src: props.src ?? '',
        alignment: props.alignment ?? 'center',
        autoplay: props.autoplay ?? false,
        muted: props.muted ?? true,
        loop: props.loop ?? false,
        controls: props.controls ?? true
      }
    }
  }

  if (block.type === 'logo') {
    const props = block.props as LogoBlockProps

    return {
      ...block,
      props: {
        ...props,
        src: props.src ?? '',
        alt: props.alt ?? 'Logo',
        link: props.link ?? '/',
        alignment: props.alignment ?? 'left',
        maxHeight: props.maxHeight ?? 48
      }
    }
  }

  if (block.type === 'shape') {
    const props = block.props as ShapeBlockProps

    return {
      ...block,
      props: {
        ...DEFAULT_SHAPE_PROPS,
        ...props,
        alignment: props.alignment ?? 'center',
        width: props.width ?? DEFAULT_SHAPE_PROPS.width,
        height: props.height ?? DEFAULT_SHAPE_PROPS.height,
        fillType: props.fillType ?? DEFAULT_SHAPE_PROPS.fillType,
        fillColor: props.fillColor ?? DEFAULT_SHAPE_PROPS.fillColor,
        gradientStart: props.gradientStart ?? DEFAULT_SHAPE_PROPS.gradientStart,
        gradientEnd: props.gradientEnd ?? DEFAULT_SHAPE_PROPS.gradientEnd,
        gradientAngle: props.gradientAngle ?? DEFAULT_SHAPE_PROPS.gradientAngle,
        gradientStyle: props.gradientStyle ?? DEFAULT_SHAPE_PROPS.gradientStyle,
        strokeWidth: props.strokeWidth ?? DEFAULT_SHAPE_PROPS.strokeWidth,
        strokeColor: props.strokeColor ?? DEFAULT_SHAPE_PROPS.strokeColor,
        opacity: props.opacity ?? DEFAULT_SHAPE_PROPS.opacity,
        rotation: props.rotation ?? DEFAULT_SHAPE_PROPS.rotation,
        borderRadius: props.borderRadius ?? DEFAULT_SHAPE_PROPS.borderRadius,
        lineStyle: props.lineStyle ?? DEFAULT_SHAPE_PROPS.lineStyle
      }
    }
  }

  if (block.type === 'icon') {
    const props = block.props as Partial<IconBlockProps> & Record<string, unknown>

    return {
      ...block,
      props: {
        iconName: props.iconName ?? DEFAULT_ICON_BLOCK_PROPS.iconName,
        alignment: props.alignment ?? DEFAULT_ICON_BLOCK_PROPS.alignment,
        iconColor: props.iconColor ?? DEFAULT_ICON_BLOCK_PROPS.iconColor,
        iconSize: props.iconSize ?? DEFAULT_ICON_BLOCK_PROPS.iconSize,
        showIconBackground: props.showIconBackground ?? DEFAULT_ICON_BLOCK_PROPS.showIconBackground,
        iconBackgroundColor: props.iconBackgroundColor ?? DEFAULT_ICON_BLOCK_PROPS.iconBackgroundColor,
        iconBorderRadius: props.iconBorderRadius ?? DEFAULT_ICON_BLOCK_PROPS.iconBorderRadius
      }
    }
  }

  if (block.type === 'section') {
    const props = block.props as SectionBlockProps
    let backgroundType = props.backgroundType ?? 'color'
    let background = normalizeStoredMediaUrl(props.background ?? props.backgroundColor ?? 'transparent', backgroundType)

    if (
      (backgroundType === 'photo' || backgroundType === 'video') &&
      !isValidMediaUrl(parseMediaUrl(background) ?? background)
    ) {
      backgroundType = 'color'
      if (background === 'transparent' || !background.trim()) {
        background = 'transparent'
      }
    }

    const usesStaticVisualFill =
      backgroundType === 'photo' ||
      backgroundType === 'video' ||
      backgroundType === 'pattern' ||
      backgroundType === 'gradient' ||
      isPhotoBackground({ ...props, background, backgroundType }) ||
      isVideoBackground({ ...props, background, backgroundType })

    return {
      ...block,
      props: {
        ...DEFAULT_SECTION_STYLE,
        ...props,
        background,
        backgroundType,
        backgroundPhotoOpacity: props.backgroundPhotoOpacity ?? 100,
        backgroundOpacity:
          usesStaticVisualFill && (props.backgroundOpacity ?? 0) === 0 ? 100 : (props.backgroundOpacity ?? 100),
        layout: props.layout ?? 'default',
        splitRatio: props.splitRatio ?? 50,
        children: Array.isArray(props.children) ? props.children.map(normalizeBlock) : [],
        primaryChildren: Array.isArray(props.primaryChildren) ? props.primaryChildren.map(normalizeBlock) : [],
        secondaryChildren: Array.isArray(props.secondaryChildren) ? props.secondaryChildren.map(normalizeBlock) : [],
        tertiaryChildren: Array.isArray(props.tertiaryChildren) ? props.tertiaryChildren.map(normalizeBlock) : [],
        quaternaryChildren: Array.isArray(props.quaternaryChildren)
          ? props.quaternaryChildren.map(normalizeBlock)
          : [],
        splitVisualAnimation: usesStaticVisualFill ? 'static' : (props.splitVisualAnimation ?? 'static'),
        splitVisualColorStart: props.splitVisualColorStart ?? '',
        splitVisualColorEnd: props.splitVisualColorEnd ?? '',
        splitVisualPlacement: props.splitVisualPlacement ?? 'background'
      }
    }
  }

  if (block.type === 'carousel') {
    const props = block.props as CarouselBlockProps
    const slides = Array.isArray(props.slides)
      ? props.slides.map(slide => ({
          id: slide.id ?? createBlockId(),
          children: Array.isArray(slide.children) ? slide.children.map(normalizeBlock) : []
        }))
      : []

    return {
      ...block,
      props: {
        ...props,
        slides: slides.length > 0 ? slides : [{ id: createBlockId(), children: [] }],
        stylePreset: props.stylePreset ?? inferCarouselStylePreset(props),
        transition: props.transition ?? 'slide',
        autoplay: props.autoplay ?? true,
        autoplayInterval: props.autoplayInterval ?? 5000,
        loop: props.loop ?? true,
        showArrows: props.showArrows ?? true,
        showDots: props.showDots ?? true,
        arrowStyle: props.arrowStyle ?? 'rounded',
        dotStyle: props.dotStyle ?? 'dots',
        slidesPerView: props.slidesPerView ?? 1,
        slideGap: props.slideGap ?? 16,
        slidePeek: props.slidePeek ?? 0,
        transitionDuration: props.transitionDuration ?? 35,
        paddingY: props.paddingY ?? 48,
        paddingX: props.paddingX ?? 24,
        maxWidth: props.maxWidth ?? 'lg',
        borderRadius: props.borderRadius ?? 12,
        slideMinHeight: props.slideMinHeight ?? 280,
        arrowColor: props.arrowColor ?? '#1a1a2e',
        dotColor: props.dotColor ?? '#6366f1',
        slidePanelColor: typeof props.slidePanelColor === 'string' ? props.slidePanelColor : '',
        slidePanelOpacity:
          typeof props.slidePanelOpacity === 'number'
            ? Math.min(100, Math.max(0, props.slidePanelOpacity))
            : 60,
        showSlidePanelBorder: props.showSlidePanelBorder ?? true,
        ...normalizeChromeBackgroundProps(
          {
            ...props,
            backgroundColor: props.backgroundColor ?? props.background ?? '#ffffff'
          },
          { backgroundColor: '#ffffff', backgroundOpacity: props.backgroundOpacity ?? 0 }
        )
      }
    }
  }

  if (block.type === 'contactForm') {
    const props = block.props as ContactFormBlockProps
    const nextProps = { ...props }

    if (nextProps.fieldBorderRadius === 2) {
      delete nextProps.fieldBorderRadius
    }

    if (nextProps.backgroundOpacity === undefined) {
      nextProps.backgroundOpacity = 0
    }

    if (!nextProps.backgroundColor) {
      nextProps.backgroundColor = '#ffffff'
    }

    if (nextProps.transparentFieldBackground === undefined) {
      nextProps.transparentFieldBackground = true
    }

    return {
      ...block,
      props: nextProps
    }
  }

  if (block.type === 'showcase') {
    const props = block.props as ShowcaseBlockProps
    const rawItems = Array.isArray(props.items) ? props.items : []
    const items: ShowcaseItem[] = (rawItems.length > 0 ? rawItems : []).map((item, index) => ({
      id: item.id || `showcase-item-${index + 1}`,
      logoSrc: item.logoSrc ?? '',
      logoAlt: item.logoAlt ?? '',
      logoText: item.logoText ?? '',
      imageSrc: item.imageSrc ?? '',
      imageAlt: item.imageAlt ?? '',
      visualKind: item.visualKind ?? (item.imageSrc ? 'image' : 'animation'),
      splitVisualAnimation: item.splitVisualAnimation ?? 'aurora',
      splitVisualColorStart: item.splitVisualColorStart ?? '',
      splitVisualColorEnd: item.splitVisualColorEnd ?? '',
      eyebrow: item.eyebrow ?? '',
      title: item.title ?? '',
      body: item.body ?? '',
      buttonText: item.buttonText ?? '',
      buttonLink: item.buttonLink ?? '#'
    }))

    return {
      ...block,
      props: {
        ...props,
        layout: props.layout ?? 'split',
        columns: props.columns ?? (props.layout === 'cards' ? 3 : 1),
        mediaSide: props.mediaSide ?? 'start',
        cardStyle: props.cardStyle ?? 'layered',
        alignment: props.alignment ?? 'left',
        textColor: props.textColor ?? '#0f172a',
        minHeight: props.minHeight ?? 520,
        paddingY: props.paddingY ?? 80,
        paddingX: props.paddingX ?? 32,
        maxWidth: props.maxWidth ?? 'lg',
        splitRatio: props.splitRatio ?? 48,
        gap: props.gap ?? 28,
        mediaRadius: props.mediaRadius ?? 28,
        mediaOverlay: props.mediaOverlay ?? 'gradient',
        buttonStyle: props.buttonStyle ?? 'theme',
        titleStyle: props.titleStyle ?? 'gradient',
        background: props.background ?? 'transparent',
        backgroundType: props.backgroundType ?? 'color',
        backgroundOpacity: props.backgroundOpacity ?? 0,
        splitVisualAnimation: props.splitVisualAnimation ?? 'static',
        splitVisualColorStart: props.splitVisualColorStart ?? '',
        splitVisualColorEnd: props.splitVisualColorEnd ?? '',
        items: items.length > 0 ? items : DEFAULT_SHOWCASE_ITEMS.map(item => ({ ...item }))
      }
    }
  }

  if (block.type === 'pricing') {
    const props = block.props as PricingBlockProps
    const defaults = createPricingDefaultProps({ layout: 'cards', columns: 3, cardStyle: 'glass' })
    const rawPlans = Array.isArray(props.plans) ? props.plans : []
    const plans: PricingPlan[] = (rawPlans.length > 0 ? rawPlans : DEFAULT_PRICING_PLANS).map((plan, index) => ({
      ...DEFAULT_PRICING_PLANS[index % DEFAULT_PRICING_PLANS.length],
      ...plan,
      id: plan.id || `pricing-plan-${index + 1}`,
      accentColor: plan.accentColor ?? '',
      cardBackground: plan.cardBackground ?? '',
      features: Array.isArray(plan.features)
        ? plan.features.map((feature, featureIndex) => ({
            id: feature.id || `pricing-feature-${index + 1}-${featureIndex + 1}`,
            text: feature.text ?? '',
            state: feature.state ?? 'included',
            hint: feature.hint ?? ''
          }))
        : DEFAULT_PRICING_PLANS[index % DEFAULT_PRICING_PLANS.length].features
    }))

    return {
      ...block,
      props: {
        ...defaults,
        ...props,
        plans
      }
    }
  }

  if (block.type === 'faq') {
    const props = block.props as FaqBlockProps
    const defaults = createFaqDefaultProps({ layout: 'stack', cardStyle: 'glass' })
    const rawItems = Array.isArray(props.items) ? props.items : []
    const items: FaqItem[] = (rawItems.length > 0 ? rawItems : DEFAULT_FAQ_ITEMS).map((item, index) => ({
      id: item.id || `faq-item-${index + 1}`,
      question: item.question ?? DEFAULT_FAQ_ITEMS[index % DEFAULT_FAQ_ITEMS.length].question,
      answer: item.answer ?? DEFAULT_FAQ_ITEMS[index % DEFAULT_FAQ_ITEMS.length].answer
    }))

    return {
      ...block,
      props: {
        ...defaults,
        ...props,
        items
      }
    }
  }

  if (block.type === 'tabs') {
    const props = block.props as TabsBlockProps
    const tabs = Array.isArray(props.tabs)
      ? props.tabs.map(panel => ({
          id: panel.id ?? createBlockId(),
          label: panel.label?.trim() || 'Tab',
          ...(panel.icon ? { icon: panel.icon } : {}),
          ...(panel.iconColor ? { iconColor: panel.iconColor } : {}),
          ...(panel.iconSize != null ? { iconSize: panel.iconSize } : {}),
          children: Array.isArray(panel.children) ? panel.children.map(normalizeBlock) : []
        }))
      : []

    return {
      ...block,
      props: {
        ...props,
        tabs: tabs.length > 0 ? tabs : [{ id: createBlockId(), label: 'Tab 1', children: [] }],
        orientation: props.orientation ?? 'horizontal',
        variant: props.variant ?? 'underline',
        activeTabColor: props.activeTabColor ?? '#1a1a2e',
        inactiveTabColor: props.inactiveTabColor ?? '#64748b',
        indicatorColor: props.indicatorColor ?? '#6366f1',
        tabBackgroundColor: props.tabBackgroundColor ?? 'transparent',
        contentBackgroundColor: props.contentBackgroundColor ?? 'transparent',
        contentBorderRadius: props.contentBorderRadius ?? 2,
        tabGap: props.tabGap ?? 4,
        paddingY: props.paddingY ?? 48,
        paddingX: props.paddingX ?? 24,
        maxWidth: props.maxWidth ?? 'lg',
        contentMinHeight: props.contentMinHeight ?? 240,
        fullWidthTabs: props.fullWidthTabs ?? false,
        contentAnimation: props.contentAnimation ?? 'fade',
        animationDuration: props.animationDuration ?? 280,
        tabBarBorderStyle: props.tabBarBorderStyle ?? 'none',
        tabBarBorderWidth: props.tabBarBorderWidth ?? 1,
        tabBarBorderColor: props.tabBarBorderColor ?? '#e2e8f0',
        tabBarBorderRadius: props.tabBarBorderRadius ?? 2,
        contentBorderStyle: props.contentBorderStyle ?? 'subtle',
        contentBorderWidth: props.contentBorderWidth ?? 1,
        contentBorderColor: props.contentBorderColor ?? '#e2e8f0',
        tabBorderRadius: props.tabBorderRadius ?? 2
      }
    }
  }

  if (block.type === 'text') {
    const props = block.props as TextBlockProps

    return {
      ...block,
      props: {
        ...props,
        variant: props.variant ?? 'paragraph',
        cite: props.cite ?? '',
        citeRole: props.citeRole ?? '',
        accentColor: props.accentColor ?? ''
      }
    }
  }

  if (block.type === 'heading') {
    const props = block.props as HeadingBlockProps

    return {
      ...block,
      props: {
        ...props,
        variant: props.variant ?? 'default'
      }
    }
  }

  if (block.type === 'serviceDirectory') {
    const props = block.props as Partial<ServiceDirectoryBlockProps>

    return {
      ...block,
      props: {
        title: props.title ?? 'Find the right service for you',
        subtitle: props.subtitle ?? 'Choose a time that works for your schedule.',
        serviceIds: Array.isArray(props.serviceIds) ? props.serviceIds : [],
        category: props.category ?? '',
        layout: props.layout ?? 'cards',
        showSearch: props.showSearch ?? true,
        showCategory: props.showCategory ?? true,
        showPrice: props.showPrice ?? true,
        showDuration: props.showDuration ?? true,
        showAvailability: props.showAvailability ?? true,
        ctaLabel: props.ctaLabel ?? 'View times',
        alignment: props.alignment ?? 'left',
        background: props.background ?? 'transparent',
        backgroundType: props.backgroundType ?? 'color',
        backgroundOpacity: props.backgroundOpacity ?? 0,
        splitVisualAnimation: props.splitVisualAnimation ?? 'static',
        splitVisualColorStart: props.splitVisualColorStart ?? '',
        splitVisualColorEnd: props.splitVisualColorEnd ?? ''
      } as ServiceDirectoryBlockProps
    }
  }

  if (block.type === 'serviceBooking') {
    const props = block.props as Partial<ServiceBookingBlockProps>

    return {
      ...block,
      props: {
        serviceSlug: props.serviceSlug ?? '',
        title: props.title ?? 'Book your appointment',
        subtitle: props.subtitle ?? 'Choose an available time below.',
        layout: props.layout ?? 'inline',
        showServiceSummary: props.showServiceSummary ?? true,
        showTimezone: props.showTimezone ?? true,
        ctaLabel: props.ctaLabel ?? 'Continue booking',
        alignment: props.alignment ?? 'left',
        background: props.background ?? 'transparent',
        backgroundType: props.backgroundType ?? 'color',
        backgroundOpacity: props.backgroundOpacity ?? 0,
        splitVisualAnimation: props.splitVisualAnimation ?? 'static',
        splitVisualColorStart: props.splitVisualColorStart ?? '',
        splitVisualColorEnd: props.splitVisualColorEnd ?? ''
      } as ServiceBookingBlockProps
    }
  }

  if (block.type === 'customerBookings') {
    const props = block.props as Partial<CustomerBookingsBlockProps>

    return {
      ...block,
      props: {
        title: props.title ?? 'Your bookings',
        subtitle: props.subtitle ?? 'View your upcoming appointments and session details.',
        alignment: props.alignment ?? 'left',
        background: props.background ?? 'transparent',
        backgroundType: props.backgroundType ?? 'color',
        backgroundOpacity: props.backgroundOpacity ?? 0,
        splitVisualAnimation: props.splitVisualAnimation ?? 'static',
        splitVisualColorStart: props.splitVisualColorStart ?? '',
        splitVisualColorEnd: props.splitVisualColorEnd ?? ''
      } as CustomerBookingsBlockProps
    }
  }

  if (block.type === 'location') {
    const props = block.props as Partial<LocationBlockProps>

    return {
      ...block,
      props: {
        title: props.title ?? 'Where are we?',
        subtitle: props.subtitle ?? 'Visit us at our location.',
        address: props.address ?? 'Add your address in Profile settings',
        latitude: typeof props.latitude === 'number' ? props.latitude : 20,
        longitude: typeof props.longitude === 'number' ? props.longitude : 0,
        source: props.source === 'custom' ? 'custom' : 'profile',
        showMap: props.showMap ?? true,
        mapZoom: props.mapZoom ?? 12,
        mapStyle: ['theme', 'standard', 'muted', 'monochrome', 'warm'].includes(props.mapStyle ?? '')
          ? props.mapStyle
          : 'theme',
        showMapControls: props.showMapControls ?? true,
        mapOpacity: typeof props.mapOpacity === 'number' ? Math.min(100, Math.max(0, props.mapOpacity)) : 85,
        alignment: props.alignment ?? 'left',
        background: props.background ?? 'transparent',
        backgroundType: props.backgroundType ?? 'color',
        backgroundOpacity: props.backgroundOpacity ?? 0,
        splitVisualAnimation: props.splitVisualAnimation ?? 'static',
        splitVisualColorStart: props.splitVisualColorStart ?? '',
        splitVisualColorEnd: props.splitVisualColorEnd ?? ''
      } as LocationBlockProps
    }
  }

  return block
}

export function normalizeBlocks(blocks: Block[]): Block[] {
  return blocks.map(normalizeBlock)
}
