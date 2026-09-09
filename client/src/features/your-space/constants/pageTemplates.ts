import type { Block } from '../types'
import { DEFAULT_SECTION_STYLE } from '../utils/sectionStyleHelpers'
import { cloneBlockWithNewIds } from '../utils/blockFactory'
import { createPricingDefaultProps } from './pricingLayout'

const CONTACT_PAGE_BLOCKS: Block[] = [
  {
    id: 'contact-header',
    type: 'header',
    props: {
      logoText: 'Your Brand',
      logoUrl: '',
      logoPosition: 'left',
      navLinks: [
        { label: 'Home', href: '/' },
        { label: 'Contact', href: 'contact' }
      ],
      layout: 'horizontal',
      backgroundColor: '#ffffff',
      backgroundOpacity: 0,
      textColor: '#1a1a2e',
      fixed: false
    }
  },
  {
    id: 'contact-hero',
    type: 'hero',
    props: {
      title: 'Contact us',
      subtitle: 'Have a question or want to work together? Send us a message and we will get back to you soon.',
      eyebrow: 'Get in touch',
      buttonText: '',
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
      minHeight: 360,
      contentMaxWidth: 'md',
      titleStyle: 'gradient',
      buttonStyle: 'theme',
      mediaOverlay: 'gradient',
      splitVisualAnimation: 'aurora'
    }
  },
  {
    id: 'contact-section',
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
          id: 'contact-form-block',
          type: 'contactForm',
          props: {
            title: 'Send us a message',
            subtitle: 'Fill out the form below and our team will respond shortly.',
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
        }
      ],
      primaryChildren: [],
      secondaryChildren: [],
      tertiaryChildren: [],
      quaternaryChildren: []
    }
  }
]

export function createContactPageBlocks(): Block[] {
  return CONTACT_PAGE_BLOCKS.map(block => cloneBlockWithNewIds(block))
}

const ABOUT_PAGE_BLOCKS: Block[] = [
  {
    id: 'about-header',
    type: 'header',
    props: {
      logoText: 'Your Brand',
      logoUrl: '',
      logoPosition: 'left',
      navLinks: [
        { label: 'Home', href: '/' },
        { label: 'About', href: 'about' },
        { label: 'Contact', href: 'contact' }
      ],
      layout: 'horizontal',
      backgroundColor: '#ffffff',
      backgroundOpacity: 0,
      textColor: '#1a1a2e',
      fixed: false
    }
  },
  {
    id: 'about-hero',
    type: 'hero',
    props: {
      title: 'Our story',
      subtitle: 'We built this company to help people get better results with care, craft, and a clear point of view.',
      eyebrow: 'About us',
      buttonText: 'Get in touch',
      buttonLink: 'contact',
      secondaryButtonText: '',
      secondaryButtonLink: '#',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 52%, #312e81 100%)',
      backgroundType: 'gradient',
      backgroundOpacity: 100,
      textColor: '#ffffff',
      alignment: 'center',
      layout: 'centered',
      verticalAlign: 'center',
      minHeight: 420,
      contentMaxWidth: 'md',
      titleStyle: 'gradient',
      buttonStyle: 'theme',
      mediaOverlay: 'gradient',
      splitVisualAnimation: 'aurora'
    }
  },
  {
    id: 'about-section',
    type: 'section',
    props: {
      background: '#ffffff',
      backgroundType: 'color',
      paddingY: 72,
      paddingX: 24,
      maxWidth: 'lg',
      layout: 'split-horizontal',
      splitRatio: 48,
      ...DEFAULT_SECTION_STYLE,
      children: [],
      primaryChildren: [
        {
          id: 'about-heading',
          type: 'heading',
          props: {
            text: 'Why we exist',
            level: 2,
            alignment: 'left',
            color: '#0f172a'
          }
        },
        {
          id: 'about-body',
          type: 'text',
          props: {
            text: 'Share the origin story, the people you serve, and the promise behind every project. Keep it specific, warm, and easy to believe.',
            alignment: 'left',
            color: '#475569'
          }
        }
      ],
      secondaryChildren: [
        {
          id: 'about-image',
          type: 'image',
          props: {
            src: '',
            alt: 'Our team at work',
            alignment: 'center'
          }
        }
      ],
      tertiaryChildren: [],
      quaternaryChildren: []
    }
  }
]

export function createAboutPageBlocks(): Block[] {
  return ABOUT_PAGE_BLOCKS.map(block => cloneBlockWithNewIds(block))
}

const PRICING_PAGE_BLOCKS: Block[] = [
  {
    id: 'pricing-header',
    type: 'header',
    props: {
      logoText: 'Your Brand',
      logoUrl: '',
      logoPosition: 'left',
      navLinks: [
        { label: 'Home', href: '/' },
        { label: 'Pricing', href: 'pricing' },
        { label: 'Contact', href: 'contact' }
      ],
      layout: 'horizontal',
      backgroundColor: '#ffffff',
      backgroundOpacity: 0,
      textColor: '#1a1a2e',
      fixed: false
    }
  },
  {
    id: 'pricing-hero',
    type: 'hero',
    props: {
      title: 'Simple pricing. Serious results.',
      subtitle: 'Pick a plan, then tailor names, features, and discounts. Annual billing is already wired in.',
      eyebrow: 'Plans',
      buttonText: 'Compare plans',
      buttonLink: '#plans',
      secondaryButtonText: 'Talk to sales',
      secondaryButtonLink: 'contact',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 52%, #312e81 100%)',
      backgroundType: 'gradient',
      backgroundOpacity: 100,
      textColor: '#ffffff',
      alignment: 'center',
      layout: 'centered',
      verticalAlign: 'center',
      minHeight: 360,
      contentMaxWidth: 'md',
      titleStyle: 'gradient',
      buttonStyle: 'theme',
      mediaOverlay: 'gradient',
      splitVisualAnimation: 'aurora'
    }
  },
  {
    id: 'pricing-block',
    type: 'pricing',
    props: createPricingDefaultProps({
      layout: 'cards',
      columns: 3,
      cardStyle: 'glass',
      eyebrow: 'Pricing',
      title: 'Choose the plan that fits',
      subtitle: 'Everything below is placeholder copy. Update plan names, prices, features, and CTAs — the layout stays put.'
    })
  }
]

export function createPricingPageBlocks(): Block[] {
  return PRICING_PAGE_BLOCKS.map(block => cloneBlockWithNewIds(block))
}
