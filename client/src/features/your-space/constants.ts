import type {
  Block,
  PaletteItem,
  SectionLayout,
  CarouselTransition,
  CarouselArrowStyle,
  TabOrientation,
  TabVariant,
  TabsBlockProps
} from './types'
import { DEFAULT_SECTION_STYLE } from './utils/sectionStyleHelpers'
import { createPricingDefaultProps, SIMPLE_PRICING_PLANS } from './constants/pricingLayout'
import { createFaqDefaultProps } from './constants/faqLayout'
import { createShowcaseDefaultProps } from './constants/showcaseLayout'

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
  stylePreset: 'slide' as const,
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
  dotColor: '#6366f1',
  slidePanelColor: '',
  slidePanelOpacity: 60,
  showSlidePanelBorder: true,
  background: 'transparent',
  backgroundType: 'color' as const,
  backgroundOpacity: 0,
  splitVisualAnimation: 'static' as const,
  splitVisualColorStart: '',
  splitVisualColorEnd: ''
}

function carouselPaletteItem(
  id: string,
  label: string,
  description: string,
  icon: string,
  stylePreset: 'slide' | 'fade' | 'cards' | 'coverflow',
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
      stylePreset,
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
  secondaryChildren: [],
  tertiaryChildren: [],
  quaternaryChildren: []
}

function sectionPaletteItem(
  id: string,
  label: string,
  description: string,
  icon: string,
  layout: SectionLayout,
  splitRatio = 50
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
      layout,
      splitRatio
    }
  }
}

export const PALETTE_ITEMS: PaletteItem[] = [
  sectionPaletteItem('section-single', 'Single', 'One content column', 'ri-layout-row-line', 'default'),
  sectionPaletteItem(
    'section-double',
    'Double',
    'Two side-by-side columns',
    'ri-layout-column-line',
    'split-horizontal'
  ),
  sectionPaletteItem('section-stacked', 'Stacked', 'Two stacked rows', 'ri-layout-grid-line', 'split-vertical'),
  sectionPaletteItem(
    'section-sidebar-left',
    'Sidebar left',
    'Narrow left, wide right',
    'ri-layout-left-line',
    'sidebar-left',
    30
  ),
  sectionPaletteItem(
    'section-sidebar-right',
    'Sidebar right',
    'Wide left, narrow right',
    'ri-layout-right-line',
    'sidebar-right',
    70
  ),
  sectionPaletteItem(
    'section-split-2-1',
    'Wide + narrow',
    'Two-thirds then one-third',
    'ri-layout-2-line',
    'split-2-1',
    67
  ),
  sectionPaletteItem(
    'section-split-1-2',
    'Narrow + wide',
    'One-third then two-thirds',
    'ri-layout-3-line',
    'split-1-2',
    33
  ),
  sectionPaletteItem('section-columns-3', 'Three columns', 'Three equal columns', 'ri-layout-column-fill', 'columns-3'),
  sectionPaletteItem('section-columns-4', 'Four columns', 'Four equal columns', 'ri-grid-line', 'columns-4'),
  carouselPaletteItem('carousel-slide', 'Carousel', 'Animated slides with your blocks', 'ri-carousel-view', 'slide', 'slide'),
  carouselPaletteItem('carousel-fade', 'Fade carousel', 'Cross-fade between slides', 'ri-transition', 'fade', 'fade', {
    autoplayInterval: 6000,
    transitionDuration: 45
  }),
  carouselPaletteItem('carousel-cards', 'Card carousel', 'Multiple cards per view', 'ri-gallery-line', 'cards', 'slide', {
    slidesPerView: 3,
    slideGap: 24,
    slidePeek: 8,
    slideMinHeight: 220,
    autoplay: false
  }),
  carouselPaletteItem('carousel-coverflow', 'Coverflow', '3D depth carousel', 'ri-stack-line', 'coverflow', 'coverflow', {
    slidePeek: 18,
    transitionDuration: 40,
    arrowStyle: 'floating'
  }),
  tabsPaletteItem(
    'tabs-horizontal-underline',
    'Underline tabs',
    'Classic underline indicator',
    'ri-layout-top-2-line',
    'horizontal',
    'underline'
  ),
  tabsPaletteItem(
    'tabs-horizontal-pills',
    'Pill tabs',
    'Rounded pill-style buttons',
    'ri-apps-line',
    'horizontal',
    'pills'
  ),
  tabsPaletteItem(
    'tabs-horizontal-segmented',
    'Segmented tabs',
    'Joined segmented control',
    'ri-layout-fill',
    'horizontal',
    'segmented',
    {
      fullWidthTabs: true,
      contentAnimation: 'scale'
    }
  ),
  tabsPaletteItem(
    'tabs-vertical-sidebar',
    'Sidebar tabs',
    'Left-rail navigation',
    'ri-layout-left-2-line',
    'vertical',
    'underline',
    {
      tabBarBorderStyle: 'subtle',
      contentBorderStyle: 'subtle'
    }
  ),
  tabsPaletteItem(
    'tabs-vertical-elevated',
    'Card sidebar',
    'Elevated card-style sidebar',
    'ri-layout-left-line',
    'vertical',
    'elevated',
    {
      contentBorderStyle: 'elevated',
      contentAnimation: 'slide-up'
    }
  ),
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
    id: 'showcase-split',
    type: 'showcase',
    label: 'Showcase split',
    description: 'Visual one side, editorial copy the other',
    icon: 'ri-layout-column-line',
    category: 'sections',
    defaultProps: createShowcaseDefaultProps({
      layout: 'split',
      columns: 1,
      cardStyle: 'stacked',
      textColor: '#0f172a',
      minHeight: 520,
      maxWidth: 'full',
      paddingX: 48
    })
  },
  {
    id: 'showcase-stack',
    type: 'showcase',
    label: 'Showcase stack',
    description: 'Layered image with logo on top and copy below',
    icon: 'ri-stack-line',
    category: 'sections',
    defaultProps: createShowcaseDefaultProps({
      layout: 'stack',
      columns: 1,
      cardStyle: 'layered',
      textColor: '#ffffff',
      minHeight: 540,
      maxWidth: 'lg'
    })
  },
  {
    id: 'showcase-cards',
    type: 'showcase',
    label: 'Showcase cards',
    description: 'Two or three tiles with logo, visual, and text',
    icon: 'ri-layout-grid-line',
    category: 'sections',
    defaultProps: createShowcaseDefaultProps({
      layout: 'cards',
      columns: 3,
      cardStyle: 'layered',
      textColor: '#ffffff',
      minHeight: 420,
      maxWidth: 'lg'
    })
  },
  {
    id: 'pricing-cards',
    type: 'pricing',
    label: 'Pricing cards',
    description: 'Monthly/annual plans with features, discounts, and a recommended card',
    icon: 'ri-price-tag-3-line',
    category: 'pricing',
    defaultProps: createPricingDefaultProps({
      layout: 'cards',
      columns: 3,
      cardStyle: 'glass'
    })
  },
  {
    id: 'pricing-comparison',
    type: 'pricing',
    label: 'Pricing comparison',
    description: 'Feature matrix with billed monthly or annually',
    icon: 'ri-table-line',
    category: 'pricing',
    defaultProps: createPricingDefaultProps({
      layout: 'comparison',
      columns: 3,
      cardStyle: 'glass',
      hoverEffect: 'none'
    })
  },
  {
    id: 'pricing-simple',
    type: 'pricing',
    label: 'Simple pricing',
    description: 'Two stacked plans without a billing toggle',
    icon: 'ri-stack-line',
    category: 'pricing',
    defaultProps: createPricingDefaultProps({
      layout: 'stack',
      columns: 2,
      cardStyle: 'glass',
      showIntervalToggle: false,
      defaultInterval: 'monthly',
      showYearlyTotal: false,
      subtitle: 'Two clear options. Edit names, prices, and features — then publish.',
      plans: SIMPLE_PRICING_PLANS
    })
  },
  {
    id: 'faq-glass',
    type: 'faq',
    label: 'FAQ glass',
    description: 'Accordion questions with a soft glass look — great on dark or animated backgrounds',
    icon: 'ri-question-answer-line',
    category: 'faq',
    defaultProps: createFaqDefaultProps({
      layout: 'stack',
      cardStyle: 'glass',
      cardBackground: '#1e1b4b',
      textColor: '#ffffff',
      cardBorderColor: 'rgba(255,255,255,0.22)',
      cardShadow: 'soft',
      defaultOpenFirst: false
    })
  },
  {
    id: 'faq-outlined',
    type: 'faq',
    label: 'FAQ light',
    description: 'Glass accordion on a light card fill — works on bright pages',
    icon: 'ri-questionnaire-line',
    category: 'faq',
    defaultProps: createFaqDefaultProps({
      layout: 'stack',
      cardStyle: 'glass',
      cardBackground: '#ffffff',
      textColor: '#0f172a',
      cardShadow: 'soft'
    })
  },
  {
    id: 'faq-split',
    type: 'faq',
    label: 'FAQ split',
    description: 'Title beside questions on desktop; stacks on mobile',
    icon: 'ri-layout-left-line',
    category: 'faq',
    defaultProps: createFaqDefaultProps({
      layout: 'split-header',
      cardStyle: 'glass',
      alignment: 'left',
      maxWidth: 'lg',
      defaultOpenFirst: true
    })
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
      color: '#1a1a2e',
      variant: 'default'
    }
  },
  {
    id: 'heading-display',
    type: 'heading',
    label: 'Display title',
    description: 'Large hero-style headline',
    icon: 'ri-font-size-2',
    category: 'typography',
    defaultProps: {
      text: 'Make a bold statement',
      level: 1,
      alignment: 'center',
      color: '#0f172a',
      variant: 'display'
    }
  },
  {
    id: 'heading-eyebrow',
    type: 'heading',
    label: 'Eyebrow',
    description: 'Small uppercase label above a title',
    icon: 'ri-text-spacing',
    category: 'typography',
    defaultProps: {
      text: 'Our clients',
      level: 3,
      alignment: 'left',
      color: '#64748b',
      variant: 'eyebrow'
    }
  },
  {
    id: 'heading-script',
    type: 'heading',
    label: 'Script heading',
    description: 'Elegant calligraphy-style headline',
    icon: 'ri-quill-pen-line',
    category: 'typography',
    defaultProps: {
      text: 'With love',
      level: 2,
      alignment: 'center',
      color: '#1a1a2e',
      variant: 'script'
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
      color: '#64748b',
      variant: 'paragraph'
    }
  },
  {
    id: 'text-lead',
    type: 'text',
    label: 'Lead text',
    description: 'Larger intro paragraph under a heading',
    icon: 'ri-font-size',
    category: 'typography',
    defaultProps: {
      text: 'A short, inviting introduction that sets the tone for the section below.',
      alignment: 'left',
      color: '#334155',
      variant: 'lead'
    }
  },
  {
    id: 'text-quote',
    type: 'text',
    label: 'Block quote',
    description: 'Classic quote with a left accent bar',
    icon: 'ri-double-quotes-l',
    category: 'typography',
    defaultProps: {
      text: 'Working with this team transformed how we show up online. Clear, calm, and beautifully built.',
      alignment: 'left',
      color: '#1e293b',
      variant: 'quote',
      cite: 'Alex Morgan',
      citeRole: 'Founder, Northwind Studio',
      accentColor: '#6366f1'
    }
  },
  {
    id: 'text-pullquote',
    type: 'text',
    label: 'Pull quote',
    description: 'Large centered quote for emphasis',
    icon: 'ri-chat-quote-line',
    category: 'typography',
    defaultProps: {
      text: 'Design is intelligence made visible.',
      alignment: 'center',
      color: '#0f172a',
      variant: 'pullquote',
      cite: '',
      citeRole: '',
      accentColor: '#6366f1'
    }
  },
  {
    id: 'text-testimonial',
    type: 'text',
    label: 'Client review',
    description: 'Testimonial quote with name and role',
    icon: 'ri-user-star-line',
    category: 'typography',
    defaultProps: {
      text: 'They understood our brand immediately and delivered a site our customers love to use.',
      alignment: 'left',
      color: '#1e293b',
      variant: 'testimonial',
      cite: 'Jordan Lee',
      citeRole: 'Marketing Director, Horizon Labs',
      accentColor: '#6366f1'
    }
  },
  {
    id: 'text-calligraphy',
    type: 'text',
    label: 'Calligraphy quote',
    description: 'Script-style quote for reviews or signatures',
    icon: 'ri-quill-pen-line',
    category: 'typography',
    defaultProps: {
      text: 'Absolutely wonderful experience from start to finish.',
      alignment: 'center',
      color: '#1a1a2e',
      variant: 'calligraphy',
      cite: 'Sam Rivera',
      citeRole: 'Happy client',
      accentColor: '#6366f1'
    }
  },
  {
    id: 'text-caption',
    type: 'text',
    label: 'Caption',
    description: 'Small supporting note under media',
    icon: 'ri-text-snippet',
    category: 'typography',
    defaultProps: {
      text: 'Photo caption or short supporting note.',
      alignment: 'left',
      color: '#94a3b8',
      variant: 'caption'
    }
  },
  {
    id: 'text-callout',
    type: 'text',
    label: 'Callout',
    description: 'Highlighted tip or key message',
    icon: 'ri-sticky-note-line',
    category: 'typography',
    defaultProps: {
      text: 'Tip: Keep this short and focused so visitors notice the key takeaway.',
      alignment: 'left',
      color: '#1e293b',
      variant: 'callout',
      accentColor: '#6366f1'
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
      action: 'link',
      serviceSlug: '',
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
      backgroundColor: '#ffffff',
      backgroundOpacity: 0,
      transparentFieldBackground: true,
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
  },
  {
    id: 'services-directory',
    type: 'serviceDirectory',
    label: 'Services directory',
    description: 'Live cards for your published services',
    icon: 'ri-calendar-check-line',
    category: 'services',
    defaultProps: {
      title: 'Find the right service for you',
      subtitle: 'Choose a time that works for your schedule.',
      serviceIds: [],
      category: '',
      layout: 'cards',
      showSearch: true,
      showCategory: true,
      showPrice: true,
      showDuration: true,
      showAvailability: true,
      ctaLabel: 'View times',
      alignment: 'left'
    }
  },
  {
    id: 'service-booking',
    type: 'serviceBooking',
    label: 'Service booking',
    description: 'Calendar and availability for one service',
    icon: 'ri-calendar-schedule-line',
    category: 'services',
    defaultProps: {
      serviceSlug: '',
      title: 'Book your appointment',
      subtitle: 'Choose an available time below.',
      layout: 'inline',
      showServiceSummary: true,
      showTimezone: true,
      ctaLabel: 'Continue booking',
      alignment: 'left'
    }
  },
  {
    id: 'customer-bookings',
    type: 'customerBookings',
    label: 'My bookings',
    description: 'Customer booking history and session details',
    icon: 'ri-calendar-user-line',
    category: 'services',
    defaultProps: {
      title: 'Your bookings',
      subtitle: 'View your upcoming appointments and session details.',
      alignment: 'left'
    }
  },
  {
    id: 'location',
    type: 'location',
    label: 'Where are we?',
    description: 'Show your address and map location',
    icon: 'ri-map-pin-line',
    category: 'sections',
    defaultProps: {
      title: 'Where are we?',
      subtitle: 'Visit us at our location.',
      address: 'Add your address in Profile settings',
      latitude: 20,
      longitude: 0,
      source: 'profile',
      showMap: true,
      mapZoom: 12,
      mapStyle: 'theme',
      showMapControls: true,
      mapOpacity: 85,
      alignment: 'left'
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
  {
    id: 'sections' as const,
    label: 'Sections',
    chipLabel: 'Sections',
    icon: 'ri-layout-masonry-line',
    defaultExpanded: true,
    itemLayout: 'tile' as const
  },
  {
    id: 'layout' as const,
    label: 'Columns',
    chipLabel: 'Columns',
    icon: 'ri-layout-grid-line',
    defaultExpanded: false,
    itemLayout: 'tile' as const
  },
  {
    id: 'carousel' as const,
    label: 'Carousels',
    chipLabel: 'Carousels',
    icon: 'ri-carousel-view',
    defaultExpanded: false,
    itemLayout: 'tile' as const
  },
  {
    id: 'tabs' as const,
    label: 'Tabs',
    chipLabel: 'Tabs',
    icon: 'ri-layout-top-2-line',
    defaultExpanded: false,
    itemLayout: 'tile' as const
  },
  {
    id: 'typography' as const,
    label: 'Typography',
    chipLabel: 'Type',
    icon: 'ri-font-size-2',
    defaultExpanded: false,
    itemLayout: 'row' as const
  },
  {
    id: 'media' as const,
    label: 'Media',
    chipLabel: 'Media',
    icon: 'ri-image-line',
    defaultExpanded: false,
    itemLayout: 'tile' as const
  },
  {
    id: 'forms' as const,
    label: 'Forms',
    chipLabel: 'Forms',
    icon: 'ri-mail-send-line',
    defaultExpanded: false,
    itemLayout: 'row' as const
  },
  {
    id: 'pricing' as const,
    label: 'Pricing',
    chipLabel: 'Pricing',
    icon: 'ri-price-tag-3-line',
    defaultExpanded: false,
    itemLayout: 'tile' as const
  },
  {
    id: 'faq' as const,
    label: 'FAQ',
    chipLabel: 'FAQ',
    icon: 'ri-question-answer-line',
    defaultExpanded: false,
    itemLayout: 'tile' as const
  },
  {
    id: 'services' as const,
    label: 'Services',
    chipLabel: 'Services',
    icon: 'ri-calendar-check-line',
    defaultExpanded: true,
    itemLayout: 'tile' as const
  }
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
      secondaryChildren: [],
      tertiaryChildren: [],
      quaternaryChildren: []
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
          secondaryChildren: [],
          tertiaryChildren: [],
          quaternaryChildren: []
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
