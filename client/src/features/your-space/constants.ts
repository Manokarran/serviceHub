import type { Block, PaletteItem, SectionLayout, CarouselTransition, CarouselArrowStyle, TabOrientation, TabVariant, TabsBlockProps } from './types'
import { DEFAULT_SECTION_STYLE } from './utils/sectionStyleHelpers'

const DEFAULT_CAROUSEL_SLIDES = [
  {
    id: 'slide-1',
    children: [
      {
        id: 'slide-1-heading',
        type: 'heading' as const,
        props: {
          text: 'First slide',
          level: 2 as const,
          alignment: 'center' as const,
          color: '#1a1a2e'
        }
      }
    ]
  },
  {
    id: 'slide-2',
    children: [
      {
        id: 'slide-2-heading',
        type: 'heading' as const,
        props: {
          text: 'Second slide',
          level: 2 as const,
          alignment: 'center' as const,
          color: '#1a1a2e'
        }
      }
    ]
  },
  {
    id: 'slide-3',
    children: [
      {
        id: 'slide-3-heading',
        type: 'heading' as const,
        props: {
          text: 'Third slide',
          level: 2 as const,
          alignment: 'center' as const,
          color: '#1a1a2e'
        }
      }
    ]
  }
]

const CAROUSEL_BASE_PROPS = {
  slides: DEFAULT_CAROUSEL_SLIDES,
  autoplay: true,
  autoplayInterval: 5000,
  loop: true,
  showArrows: true,
  showDots: true,
  arrowStyle: 'rounded' as CarouselArrowStyle,
  dotStyle: 'dots' as const,
  slidesPerView: 1,
  slideGap: 16,
  slidePeek: 0,
  transitionDuration: 35,
  paddingY: 48,
  paddingX: 24,
  maxWidth: 'lg' as const,
  borderRadius: 12,
  slideMinHeight: 280,
  arrowColor: '#1a1a2e',
  dotColor: '#6366f1'
}

function carouselPaletteItem(
  id: string,
  label: string,
  description: string,
  icon: string,
  transition: CarouselTransition,
  overrides?: Partial<typeof CAROUSEL_BASE_PROPS>
): PaletteItem {
  return {
    id,
    type: 'carousel',
    label,
    description,
    icon,
    category: 'carousel',
    defaultProps: {
      ...CAROUSEL_BASE_PROPS,
      transition,
      ...overrides
    }
  }
}

const DEFAULT_TAB_PANELS = [
  {
    id: 'tab-1',
    label: 'Overview',
    icon: 'Hub',
    children: [
      {
        id: 'tab-1-heading',
        type: 'heading' as const,
        props: {
          text: 'Overview',
          level: 2 as const,
          alignment: 'left' as const,
          color: '#1a1a2e'
        }
      },
      {
        id: 'tab-1-text',
        type: 'text' as const,
        props: {
          text: 'Add content for this tab using the block palette or drag blocks here.',
          alignment: 'left' as const,
          color: '#64748b'
        }
      }
    ]
  },
  {
    id: 'tab-2',
    label: 'Features',
    icon: 'AutoAwesome',
    children: [
      {
        id: 'tab-2-heading',
        type: 'heading' as const,
        props: {
          text: 'Features',
          level: 2 as const,
          alignment: 'left' as const,
          color: '#1a1a2e'
        }
      }
    ]
  },
  {
    id: 'tab-3',
    label: 'Details',
    icon: 'Assessment',
    children: [
      {
        id: 'tab-3-heading',
        type: 'heading' as const,
        props: {
          text: 'Details',
          level: 2 as const,
          alignment: 'left' as const,
          color: '#1a1a2e'
        }
      }
    ]
  }
]

const TABS_BASE_PROPS = {
  tabs: DEFAULT_TAB_PANELS,
  orientation: 'horizontal' as TabOrientation,
  variant: 'underline' as TabVariant,
  activeTabColor: '#1a1a2e',
  inactiveTabColor: '#64748b',
  indicatorColor: '#6366f1',
  tabBackgroundColor: 'transparent',
  contentBackgroundColor: 'transparent',
  contentBorderRadius: 2,
  tabGap: 8,
  paddingY: 48,
  paddingX: 24,
  maxWidth: 'lg' as const,
  contentMinHeight: 240,
  fullWidthTabs: false,
  contentAnimation: 'slide-horizontal' as const,
  animationDuration: 240,
  tabBarBorderStyle: 'none' as const,
  tabBarBorderWidth: 1,
  tabBarBorderColor: '#e2e8f0',
  tabBarBorderRadius: 2,
  contentBorderStyle: 'subtle' as const,
  contentBorderWidth: 1,
  contentBorderColor: '#e2e8f0',
  tabBorderRadius: 2
}

function tabsPaletteItem(
  id: string,
  label: string,
  description: string,
  icon: string,
  orientation: TabOrientation,
  variant: TabVariant,
  overrides?: Partial<TabsBlockProps>
): PaletteItem {
  return {
    id,
    type: 'tabs',
    label,
    description,
    icon,
    category: 'tabs',
    defaultProps: {
      ...TABS_BASE_PROPS,
      orientation,
      variant,
      ...overrides
    }
  }
}

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
  carouselPaletteItem('carousel-slide', 'Carousel', 'Animated slides with your blocks', 'ri-carousel-view', 'slide'),
  carouselPaletteItem('carousel-fade', 'Fade carousel', 'Cross-fade between slides', 'ri-transition', 'fade', {
    autoplayInterval: 6000,
    transitionDuration: 45
  }),
  carouselPaletteItem('carousel-cards', 'Card carousel', 'Multiple cards per view', 'ri-gallery-line', 'slide', {
    slidesPerView: 3,
    slideGap: 24,
    slidePeek: 8,
    slideMinHeight: 220,
    autoplay: false
  }),
  carouselPaletteItem('carousel-coverflow', 'Coverflow', '3D depth carousel', 'ri-stack-line', 'coverflow', {
    slidePeek: 18,
    transitionDuration: 40,
    arrowStyle: 'floating'
  }),
  tabsPaletteItem('tabs-horizontal-underline', 'Underline tabs', 'Classic underline indicator', 'ri-layout-top-2-line', 'horizontal', 'underline'),
  tabsPaletteItem('tabs-horizontal-pills', 'Pill tabs', 'Rounded pill-style buttons', 'ri-apps-line', 'horizontal', 'pills'),
  tabsPaletteItem('tabs-horizontal-segmented', 'Segmented tabs', 'Joined segmented control', 'ri-layout-fill', 'horizontal', 'segmented', {
    fullWidthTabs: true,
    contentAnimation: 'scale'
  }),
  tabsPaletteItem('tabs-vertical-sidebar', 'Sidebar tabs', 'Left-rail navigation', 'ri-layout-left-2-line', 'vertical', 'underline', {
    tabBarBorderStyle: 'subtle',
    contentBorderStyle: 'subtle'
  }),
  tabsPaletteItem('tabs-vertical-elevated', 'Card sidebar', 'Elevated card-style sidebar', 'ri-layout-left-line', 'vertical', 'elevated', {
    contentBorderStyle: 'elevated',
    contentAnimation: 'slide-up'
  }),
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
      title: 'Build something people love',
      subtitle: 'Launch a polished site in minutes — modern, fast, and unmistakably yours.',
      eyebrow: 'Now live',
      buttonText: 'Get started',
      buttonLink: '#',
      secondaryButtonText: 'See how it works',
      secondaryButtonLink: '#',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 52%, #312e81 100%)',
      backgroundType: 'gradient',
      backgroundOpacity: 100,
      textColor: '#ffffff',
      alignment: 'center',
      layout: 'centered',
      verticalAlign: 'center',
      minHeight: 560,
      contentMaxWidth: 'lg',
      contentPaddingX: 32,
      contentPaddingY: 64,
      splitRatio: 50,
      titleStyle: 'gradient',
      contentSurface: 'none',
      buttonStyle: 'theme',
      mediaOverlay: 'gradient',
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
  },
  {
    id: 'shape',
    type: 'shape',
    label: 'Shape',
    description: 'Decorative shape with solid or gradient fill',
    icon: 'ri-shape-line',
    category: 'media',
    defaultProps: {
      variant: 'rectangle',
      alignment: 'center',
      width: 200,
      height: 200,
      fillType: 'gradient',
      fillColor: '#6366f1',
      gradientStart: '#6366f1',
      gradientEnd: '#8b5cf6',
      gradientAngle: 135,
      gradientStyle: 'linear',
      strokeWidth: 0,
      strokeColor: '#1a1a2e',
      opacity: 100,
      rotation: 0,
      borderRadius: 12,
      lineStyle: 'solid'
    }
  },
  {
    id: 'icon',
    type: 'icon',
    label: 'Icon',
    description: 'IT & tech icon for services or product lists',
    icon: 'ri-apps-2-line',
    category: 'typography',
    defaultProps: {
      iconName: 'Cloud',
      alignment: 'left',
      iconColor: '#6366f1',
      iconSize: 44,
      showIconBackground: false,
      iconBackgroundColor: '#6366f1',
      iconBorderRadius: 12
    }
  },
  {
    id: 'contactForm',
    type: 'contactForm',
    label: 'Contact Form',
    description: 'Collect visitor details and notify your team',
    icon: 'ri-mail-send-line',
    category: 'forms',
    defaultProps: {
      title: 'Get in touch',
      subtitle: 'We would love to hear from you. Send us a message and we will respond as soon as we can.',
      submitLabel: 'Send message',
      successMessage: 'Thank you! Your message has been sent.',
      signupLabel: 'I am interested in signing up',
      showSignupOption: true,
      alignment: 'center',
      fieldBorderRadius: 2,
      fieldBorderWidth: 1,
      submitVariant: 'theme'
    }
  },
  {
    id: 'divider',
    type: 'shape',
    label: 'Divider',
    description: 'Horizontal line with divider styles',
    icon: 'ri-separator',
    category: 'media',
    defaultProps: {
      variant: 'line',
      alignment: 'center',
      width: 480,
      height: 8,
      fillType: 'solid',
      fillColor: '#cbd5e1',
      gradientStart: '#6366f1',
      gradientEnd: '#8b5cf6',
      gradientAngle: 90,
      gradientStyle: 'linear',
      strokeWidth: 0,
      strokeColor: '#1a1a2e',
      opacity: 100,
      rotation: 0,
      borderRadius: 0,
      lineStyle: 'solid'
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
  { id: 'sections' as const, label: 'Sections', icon: 'ri-layout-masonry-line', defaultExpanded: true },
  { id: 'layout' as const, label: 'Columns', icon: 'ri-layout-grid-line', defaultExpanded: true },
  { id: 'carousel' as const, label: 'Carousels', icon: 'ri-carousel-view', defaultExpanded: false },
  { id: 'tabs' as const, label: 'Tabs', icon: 'ri-layout-top-2-line', defaultExpanded: false },
  { id: 'typography' as const, label: 'Typography', icon: 'ri-font-size-2', defaultExpanded: false },
  { id: 'media' as const, label: 'Media', icon: 'ri-image-line', defaultExpanded: false },
  { id: 'forms' as const, label: 'Forms', icon: 'ri-mail-send-line', defaultExpanded: false }
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
      eyebrow: 'Your space',
      buttonText: 'Get Started',
      buttonLink: '#',
      secondaryButtonText: '',
      secondaryButtonLink: '#',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 52%, #312e81 100%)',
      backgroundType: 'gradient',
      backgroundOpacity: 100,
      textColor: '#ffffff',
      alignment: 'center',
      layout: 'centered',
      verticalAlign: 'center',
      minHeight: 560,
      contentMaxWidth: 'lg',
      titleStyle: 'gradient',
      buttonStyle: 'theme',
      mediaOverlay: 'gradient',
      splitVisualAnimation: 'aurora'
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

export function getStorageKey(tenantSlug: string, pageSlug = 'home') {
  return `${STORAGE_KEY_PREFIX}:${tenantSlug}:${pageSlug}`
}
