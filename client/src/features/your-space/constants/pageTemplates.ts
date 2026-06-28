import type { Block } from '../types'
import { DEFAULT_SECTION_STYLE } from '../utils/sectionStyleHelpers'
import { cloneBlockWithNewIds } from '../utils/blockFactory'

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
      secondaryChildren: []
    }
  }
]

export function createContactPageBlocks(): Block[] {
  return CONTACT_PAGE_BLOCKS.map(block => cloneBlockWithNewIds(block))
}
