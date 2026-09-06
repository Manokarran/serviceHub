export type PromptSuggestion = {
  id: string
  label: string
  prompt: string
  icon: string
}

/** Quick-start chips under the build prompt — each fills the textarea. */
export const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'salon',
    label: 'Salon bookings',
    prompt: 'A polished booking website for a hair salon with services, stylists, and online appointments',
    icon: 'ri-scissors-cut-line'
  },
  {
    id: 'portfolio',
    label: 'Creative portfolio',
    prompt: 'A bold portfolio site for a photographer with a gallery, about story, and contact CTA',
    icon: 'ri-camera-lens-line'
  },
  {
    id: 'cafe',
    label: 'Café & menu',
    prompt: 'A warm café website with menu highlights, opening hours, and a find-us section',
    icon: 'ri-cup-line'
  },
  {
    id: 'fitness',
    label: 'Fitness studio',
    prompt: 'An energetic fitness studio site with class schedule, membership CTAs, and trainer bios',
    icon: 'ri-heart-pulse-line'
  },
  {
    id: 'agency',
    label: 'Local services',
    prompt: 'A trustworthy local services website that showcases offerings, reviews, and a quote request form',
    icon: 'ri-tools-line'
  },
  {
    id: 'landing',
    label: 'Product launch',
    prompt: 'A high-converting landing page for a new product with hero, benefits, social proof, and waitlist signup',
    icon: 'ri-rocket-line'
  }
]

/** Cycled through the headline so the promise reads as "anything you run". */
export const ROTATING_BUSINESSES = ['salon', 'café', 'studio', 'clinic', 'agency', 'boutique', 'gym'] as const

export type CreativeStartOption = {
  id: 'ai' | 'blank' | 'inspire'
  title: string
  subtitle: string
  icon: string
  accent: 'violet' | 'cyan' | 'pink'
}

export const CREATIVE_START_OPTIONS: CreativeStartOption[] = [
  {
    id: 'ai',
    title: 'Describe it',
    subtitle: 'Type a vision and let AI compose the first draft',
    icon: 'ri-sparkling-2-line',
    accent: 'violet'
  },
  {
    id: 'inspire',
    title: 'Start from a look',
    subtitle: 'Browse published templates and make one yours',
    icon: 'ri-layout-masonry-line',
    accent: 'cyan'
  },
  {
    id: 'blank',
    title: 'Blank canvas',
    subtitle: 'Skip templates — build every section yourself',
    icon: 'ri-brush-line',
    accent: 'pink'
  }
]

export type RegisterProofPoint = {
  id: string
  icon: string
  label: string
}

/** Reassurance strip under the fold — what happens after the prompt. */
export const REGISTER_PROOF_POINTS: RegisterProofPoint[] = [
  { id: 'pages', icon: 'ri-pages-line', label: 'Full multi-page site, not a single landing page' },
  { id: 'edit', icon: 'ri-drag-move-2-line', label: 'Drag-and-drop editing on every section' },
  { id: 'chat', icon: 'ri-chat-smile-2-line', label: 'Keep refining by chatting with the builder' },
  { id: 'publish', icon: 'ri-global-line', label: 'Publish when it looks exactly right' }
]
