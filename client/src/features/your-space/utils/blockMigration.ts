import type {
  Block,
  FooterBlockProps,
  HeaderBlockProps,
  HeroBlockProps,
  ImageBlockProps,
  LogoBlockProps,
  SectionBlockProps,
  NavLinkItem,
  VideoBlockProps
} from '../types'
import { DEFAULT_SECTION_STYLE } from './sectionStyleHelpers'

export function normalizeNavLinks(links: unknown): NavLinkItem[] {
  if (!Array.isArray(links)) {
    return []
  }

  return links
    .map(link => {
      if (typeof link === 'string') {
        const label = link.trim()

        return label ? { label, href: `#${label.toLowerCase().replace(/\s+/g, '-')}` } : null
      }

      if (link && typeof link === 'object' && 'label' in link) {
        const item = link as NavLinkItem

        return item.label.trim() ? { label: item.label.trim(), href: item.href?.trim() || '#' } : null
      }

      return null
    })
    .filter((link): link is NavLinkItem => link !== null)
}

export function normalizeBlock(block: Block): Block {
  if (block.type === 'header') {
    const props = block.props as HeaderBlockProps

    return {
      ...block,
      props: {
        ...props,
        logoUrl: props.logoUrl ?? '',
        logoPosition: props.logoPosition ?? 'left',
        layout: props.layout ?? 'horizontal',
        fixed: props.fixed ?? false,
        borderRadius: props.borderRadius ?? 0,
        backgroundOpacity: props.backgroundOpacity ?? 0,
        navLinks: normalizeNavLinks(props.navLinks)
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
        logoPosition: props.logoPosition ?? 'left',
        copyrightText: props.copyrightText ?? '© Your Brand. All rights reserved.',
        layout: props.layout ?? 'horizontal',
        fixed: props.fixed ?? false,
        borderRadius: props.borderRadius ?? 0,
        backgroundOpacity: props.backgroundOpacity ?? 100,
        navLinks: normalizeNavLinks(props.navLinks)
      }
    }
  }

  if (block.type === 'hero') {
    const props = block.props as HeroBlockProps
    const background = props.background ?? props.backgroundColor ?? '#6366f1'

    return {
      ...block,
      props: {
        ...props,
        background,
        backgroundType: props.backgroundType ?? 'color',
        backgroundPhotoOpacity: props.backgroundPhotoOpacity ?? 100,
        backgroundOpacity: props.backgroundOpacity ?? 0,
        layout: props.layout ?? 'centered',
        splitVisualAnimation: props.splitVisualAnimation ?? 'aurora',
        splitVisualColorStart: props.splitVisualColorStart ?? '',
        splitVisualColorEnd: props.splitVisualColorEnd ?? ''
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
        alignment: props.alignment ?? 'center'
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

  if (block.type === 'section') {
    const props = block.props as SectionBlockProps
    const background = props.background ?? props.backgroundColor ?? '#ffffff'

    return {
      ...block,
      props: {
        ...DEFAULT_SECTION_STYLE,
        ...props,
        background,
        backgroundType: props.backgroundType ?? 'color',
        backgroundPhotoOpacity: props.backgroundPhotoOpacity ?? 100,
        backgroundOpacity: props.backgroundOpacity ?? 100,
        layout: props.layout ?? 'default',
        splitRatio: props.splitRatio ?? 50,
        children: Array.isArray(props.children) ? props.children.map(normalizeBlock) : [],
        primaryChildren: Array.isArray(props.primaryChildren) ? props.primaryChildren.map(normalizeBlock) : [],
        secondaryChildren: Array.isArray(props.secondaryChildren) ? props.secondaryChildren.map(normalizeBlock) : [],
        splitVisualAnimation: props.splitVisualAnimation ?? 'aurora',
        splitVisualColorStart: props.splitVisualColorStart ?? '',
        splitVisualColorEnd: props.splitVisualColorEnd ?? ''
      }
    }
  }

  return block
}

export function normalizeBlocks(blocks: Block[]): Block[] {
  return blocks.map(normalizeBlock)
}
