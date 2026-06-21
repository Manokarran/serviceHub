import type { Block, PaletteItem, SectionLayout } from './types'
import { DEFAULT_SECTION_STYLE } from './utils/sectionStyleHelpers'

const SECTION_BASE_PROPS = {
  background: 'transparent',
  backgroundType: 'color' as const,
  backgroundOpacity: 0,
  paddingY: 64,
  paddingX: 24,
  maxWidth: 'lg' as const,
  splitRatio: 50,
  splitVisualAnimation: 'static' as const,
  ...DEFAULT_SECTION_STYLE,
  children: [],
  primaryChildren: [],
  secondaryChildren: []
}

function sectionPaletteItem(
  id: string,
  label: string,
  description: string,
  icon: string,
  layout: SectionLayout
): PaletteItem {
  return {
    id,
    type: 'section',
    label,
    description,
    icon,
    category: 'layout',
    defaultProps: {
      ...SECTION_BASE_PROPS,
      layout
    }
  }
}

export const PALETTE_ITEMS: PaletteItem[] = [
  sectionPaletteItem('section-single', 'Single', 'One content column', 'ri-layout-row-line', 'default'),
  sectionPaletteItem('section-double', 'Double', 'Two side-by-side columns', 'ri-layout-column-line', 'split-horizontal'),
  sectionPaletteItem('section-stacked', 'Stacked', 'Two stacked rows', 'ri-layout-grid-line', 'split-vertical'),
  {
    id: 'header',
    type: 'header',
    label: 'Header',
    description: 'Top navigation bar',
    icon: 'ri-layout-top-line',
    category: 'sections',
    defaultProps: {
      logoText: 'Your Brand',
      logoUrl: '',
      logoPosition: 'left',
      navLinks: [
        { label: 'Home', href: '#' },
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Contact', href: '#contact' }
      ],
      layout: 'horizontal',
      backgroundColor: '#ffffff',
      backgroundOpacity: 0,
      textColor: '#1a1a2e',
      fixed: false
    }
  },
  {
    id: 'footer',
    type: 'footer',
    label: 'Footer',
    description: 'Bottom bar with links and copyright',
    icon: 'ri-layout-bottom-line',
    category: 'sections',
    defaultProps: {
      logoText: 'Your Brand',
      logoUrl: '',
      logoPosition: 'left',
      copyrightText: '© 2026 Your Brand. All rights reserved.',
      navLinks: [
        { label: 'Privacy', href: '#privacy' },
        { label: 'Terms', href: '#terms' },
        { label: 'Contact', href: '#contact' }
      ],
      layout: 'horizontal',
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      fixed: false
    }
  },
  {
    id: 'hero',
    type: 'hero',
    label: 'Hero',
    description: 'Large banner with headline',
    icon: 'ri-image-line',
    category: 'sections',
    defaultProps: {
      title: 'Build something amazing',
      subtitle: 'Create a beautiful website for your business in minutes.',
      buttonText: 'Get Started',
      buttonLink: '#',
      background: '#6366f1',
      backgroundType: 'color',
      backgroundOpacity: 0,
      textColor: '#ffffff',
      alignment: 'center',
      layout: 'centered',
      minHeight: 480,
      splitVisualAnimation: 'aurora'
    }
  },
  {
    id: 'heading',
    type: 'heading',
    label: 'Heading',
    description: 'Title or section header',
    icon: 'ri-heading',
    category: 'typography',
    defaultProps: {
      text: 'Your heading here',
      level: 2,
      alignment: 'left',
      color: '#1a1a2e'
    }
  },
  {
    id: 'text',
    type: 'text',
    label: 'Paragraph',
    description: 'Body text content',
    icon: 'ri-text',
    category: 'typography',
    defaultProps: {
      text: 'Add your content here. Tell visitors about your business, services, or story.',
      alignment: 'left',
      color: '#64748b'
    }
  },
  {
    id: 'button',
    type: 'button',
    label: 'Button',
    description: 'Call-to-action link',
    icon: 'ri-cursor-line',
    category: 'typography',
    defaultProps: {
      text: 'Learn More',
      link: '#',
      variant: 'contained',
      alignment: 'left',
      color: '#6366f1'
    }
  },
  {
    id: 'image',
    type: 'image',
    label: 'Image',
    description: 'Photo or graphic',
    icon: 'ri-image-2-line',
    category: 'media',
    defaultProps: {
      src: '',
      alt: 'Image description',
      alignment: 'center'
    }
  },
  {
    id: 'video',
    type: 'video',
    label: 'Video',
    description: 'Upload a clip or embed from YouTube/Vimeo',
    icon: 'ri-video-line',
    category: 'media',
    defaultProps: {
      src: '',
      alignment: 'center',
      autoplay: false,
      muted: true,
      loop: false,
      controls: true
    }
  },
  {
    id: 'logo',
    type: 'logo',
    label: 'Logo',
    description: 'Brand logo with optional link',
    icon: 'ri-shining-line',
    category: 'media',
    defaultProps: {
      src: '',
      alt: 'Company logo',
      link: '/',
      alignment: 'left',
      maxHeight: 48
    }
  }
]

export function getPaletteItem(paletteId?: string, type?: PaletteItem['type']): PaletteItem | undefined {
  if (paletteId) {
    return PALETTE_ITEMS.find(item => item.id === paletteId)
  }

  if (type) {
    return PALETTE_ITEMS.find(item => item.type === type)
  }

  return undefined
}

export const PALETTE_CATEGORIES = [
  { id: 'layout' as const, label: 'Layout', icon: 'ri-layout-grid-line' },
  { id: 'sections' as const, label: 'Sections', icon: 'ri-layout-masonry-line' },
  { id: 'media' as const, label: 'Media', icon: 'ri-image-line' },
  { id: 'typography' as const, label: 'Typography', icon: 'ri-font-size-2' }
]

export const STARTER_BLOCKS: Block[] = [
  {
    id: 'starter-header',
    type: 'header',
    props: {
      logoText: 'Your Brand',
      logoUrl: '',
      logoPosition: 'left',
      navLinks: [
        { label: 'Home', href: '#' },
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Contact', href: '#contact' }
      ],
      layout: 'horizontal',
      backgroundColor: '#ffffff',
      backgroundOpacity: 0,
      textColor: '#1a1a2e',
      fixed: false
    }
  },
  {
    id: 'starter-hero',
    type: 'hero',
    props: {
      title: 'Welcome to your website',
      subtitle: 'Drag components from the left panel to customize your page.',
      buttonText: 'Get Started',
      buttonLink: '#',
      background: '#6366f1',
      backgroundType: 'color',
      backgroundOpacity: 0,
      textColor: '#ffffff',
      alignment: 'center',
      layout: 'centered',
      minHeight: 480
    }
  },
  {
    id: 'starter-section',
    type: 'section',
    props: {
      background: '#f8fafc',
      backgroundType: 'color',
      paddingY: 64,
      paddingX: 24,
      maxWidth: 'lg',
      layout: 'default',
      splitRatio: 50,
      ...DEFAULT_SECTION_STYLE,
      children: [
        {
          id: 'starter-heading',
          type: 'heading',
          props: {
            text: 'About Us',
            level: 2,
            alignment: 'center',
            color: '#1a1a2e'
          }
        },
        {
          id: 'starter-text',
          type: 'text',
          props: {
            text: 'Tell your story here. Share what makes your business unique and why customers should choose you.',
            alignment: 'center',
            color: '#64748b'
          }
        }
      ],
      primaryChildren: [],
      secondaryChildren: []
    }
  }
]

export function createStarterBlocks(): Block[] {
  return STARTER_BLOCKS.map(block => {
    if (block.type === 'section') {
      const props = block.props as import('./types').SectionBlockProps

      return {
        ...block,
        id: `${block.type}-${crypto.randomUUID()}`,
        props: {
          ...props,
          children: props.children.map(child => ({ ...child, id: `${child.type}-${crypto.randomUUID()}` })),
          primaryChildren: [],
          secondaryChildren: []
        }
      }
    }

    return { ...block, id: `${block.type}-${crypto.randomUUID()}` }
  })
}

export const STORAGE_KEY_PREFIX = 'your-space-page'

export function getStorageKey(tenantSlug: string) {
  return `${STORAGE_KEY_PREFIX}:${tenantSlug}`
}
