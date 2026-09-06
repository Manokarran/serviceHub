import type {
  ShowcaseBlockProps,
  ShowcaseCardStyle,
  ShowcaseColumns,
  ShowcaseItem,
  ShowcaseLayout,
  ShowcaseMediaSide,
  ShowcaseVisualKind
} from '../types'

type ShowcaseOption<T extends string> = {
  value: T
  label: string
  icon: string
}

export const SHOWCASE_LAYOUT_OPTIONS: ShowcaseOption<ShowcaseLayout>[] = [
  { value: 'split', label: 'Split', icon: 'ri-layout-column-line' },
  { value: 'stack', label: 'Stack', icon: 'ri-layout-row-line' },
  { value: 'cards', label: 'Cards', icon: 'ri-layout-grid-line' }
]

export const SHOWCASE_COLUMN_OPTIONS: ShowcaseOption<`${ShowcaseColumns}`>[] = [
  { value: '1', label: '1', icon: 'ri-checkbox-blank-line' },
  { value: '2', label: '2', icon: 'ri-layout-column-line' },
  { value: '3', label: '3', icon: 'ri-layout-grid-line' }
]

export const SHOWCASE_MEDIA_SIDE_OPTIONS: ShowcaseOption<ShowcaseMediaSide>[] = [
  { value: 'start', label: 'Start', icon: 'ri-align-left' },
  { value: 'end', label: 'End', icon: 'ri-align-right' }
]

export const SHOWCASE_CARD_STYLE_OPTIONS: ShowcaseOption<ShowcaseCardStyle>[] = [
  { value: 'layered', label: 'Layered', icon: 'ri-stack-line' },
  { value: 'stacked', label: 'Stacked', icon: 'ri-layout-top-2-line' }
]

export const SHOWCASE_VISUAL_KIND_OPTIONS: ShowcaseOption<ShowcaseVisualKind>[] = [
  { value: 'image', label: 'Image', icon: 'ri-image-line' },
  { value: 'logo', label: 'Logo', icon: 'ri-shining-line' },
  { value: 'animation', label: 'Motion', icon: 'ri-sparkling-line' }
]

export const SHOWCASE_MAX_ITEMS = 3

export const DEFAULT_SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'showcase-item-1',
    logoSrc: '',
    logoAlt: 'Studio mark',
    logoText: 'Atelier',
    imageSrc: '',
    imageAlt: 'Architectural interior',
    visualKind: 'animation',
    imageHoverEffect: 'zoom',
    splitVisualAnimation: 'aurora',
    splitVisualColorStart: '',
    splitVisualColorEnd: '',
    eyebrow: 'The studio',
    title: 'Spaces that feel inevitable',
    body: 'A considered composition of light, material, and proportion — designed to be lived in, not just looked at.',
    buttonText: 'Explore the work',
    buttonLink: '#'
  },
  {
    id: 'showcase-item-2',
    logoSrc: '',
    logoAlt: 'Craft mark',
    logoText: 'Craft',
    imageSrc: '',
    imageAlt: 'Material detail',
    visualKind: 'animation',
    imageHoverEffect: 'zoom',
    splitVisualAnimation: 'mesh-gradient',
    splitVisualColorStart: '',
    splitVisualColorEnd: '',
    eyebrow: 'The method',
    title: 'Detail you can feel',
    body: 'Every junction, surface, and line is resolved with the same care as the first sketch. Quiet luxury, built to last.',
    buttonText: 'See the process',
    buttonLink: '#'
  },
  {
    id: 'showcase-item-3',
    logoSrc: '',
    logoAlt: 'Horizon mark',
    logoText: 'Horizon',
    imageSrc: '',
    imageAlt: 'Landscape form',
    visualKind: 'animation',
    imageHoverEffect: 'zoom',
    splitVisualAnimation: 'geometric',
    splitVisualColorStart: '',
    splitVisualColorEnd: '',
    eyebrow: 'The vision',
    title: 'Form following purpose',
    body: 'We shape environments that serve people first — calm, clear, and unmistakably yours.',
    buttonText: 'Start a project',
    buttonLink: '#'
  }
]

const SHOWCASE_SHARED_PROPS: Omit<ShowcaseBlockProps, 'layout' | 'columns' | 'cardStyle' | 'textColor' | 'minHeight'> = {
  mediaSide: 'start',
  alignment: 'left',
  paddingY: 80,
  paddingX: 32,
  maxWidth: 'lg',
  splitRatio: 48,
  gap: 28,
  mediaRadius: 28,
  mediaOverlay: 'gradient',
  buttonStyle: 'theme',
  titleStyle: 'solid',
  background: 'transparent',
  backgroundType: 'color',
  backgroundOpacity: 0,
  splitVisualAnimation: 'static',
  splitVisualColorStart: '',
  splitVisualColorEnd: '',
  items: DEFAULT_SHOWCASE_ITEMS
}

export function createShowcaseDefaultProps(
  overrides: Pick<ShowcaseBlockProps, 'layout' | 'columns' | 'cardStyle' | 'textColor' | 'minHeight'> &
    Partial<ShowcaseBlockProps>
): ShowcaseBlockProps {
  return {
    ...SHOWCASE_SHARED_PROPS,
    ...overrides,
    items: overrides.items ?? DEFAULT_SHOWCASE_ITEMS.map(item => ({ ...item }))
  }
}
