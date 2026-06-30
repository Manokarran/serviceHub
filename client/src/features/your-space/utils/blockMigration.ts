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
  NavLinkItem,
  VideoBlockProps
} from '../types'
import { createBlockId } from './blockFactory'
import { DEFAULT_SHAPE_PROPS } from '../constants/shapeBlock'
import { DEFAULT_ICON_BLOCK_PROPS } from '../constants/iconBlock'
import { DEFAULT_LOGO_ICON_STYLE } from '@/components/iconPickerStyle'
import { DEFAULT_SECTION_STYLE, isPhotoBackground, isVideoBackground, isValidMediaUrl, normalizeStoredMediaUrl, parseMediaUrl } from './sectionStyleHelpers'

export function normalizeNavLinks(links: unknown): NavLinkItem[] {
  if (!Array.isArray(links)) {
    return []
  }

  const normalizeNavItem = (link: unknown): NavLinkItem | null => {
    if (typeof link === 'string') {
      const label = link.trim()

      return label ? { label, href: `#${label.toLowerCase().replace(/\s+/g, '-')}` } : null
    }

    if (link && typeof link === 'object' && 'label' in link) {
      const item = link as NavLinkItem & { children?: unknown }
      const label = item.label?.trim()

      if (!label) {
        return null
      }

      const children = Array.isArray(item.children)
        ? item.children
            .map(child => normalizeNavItem(child))
            .filter((child): child is NavLinkItem => child !== null)
        : []

      return {
        label,
        href: item.href?.trim() || '#',
        ...(children.length > 0 ? { children } : {})
      }
    }

    return null
  }

  return links
    .map(link => normalizeNavItem(link))
    .filter((link): link is NavLinkItem => link !== null)
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
    let background = normalizeStoredMediaUrl(
      props.background ?? props.backgroundColor ?? '#6366f1',
      backgroundType
    )

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
        titleStyle: props.titleStyle ?? 'solid',
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
        adjustments: props.adjustments ?? null
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
    let background = normalizeStoredMediaUrl(
      props.background ?? props.backgroundColor ?? 'transparent',
      backgroundType
    )

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
          usesStaticVisualFill && (props.backgroundOpacity ?? 0) === 0
            ? 100
            : (props.backgroundOpacity ?? 100),
        layout: props.layout ?? 'default',
        splitRatio: props.splitRatio ?? 50,
        children: Array.isArray(props.children) ? props.children.map(normalizeBlock) : [],
        primaryChildren: Array.isArray(props.primaryChildren) ? props.primaryChildren.map(normalizeBlock) : [],
        secondaryChildren: Array.isArray(props.secondaryChildren) ? props.secondaryChildren.map(normalizeBlock) : [],
        splitVisualAnimation: usesStaticVisualFill
          ? 'static'
          : (props.splitVisualAnimation ?? 'static'),
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
        dotColor: props.dotColor ?? '#6366f1'
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

  return block
}

export function normalizeBlocks(blocks: Block[]): Block[] {
  return blocks.map(normalizeBlock)
}
