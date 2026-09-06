import type { CarouselArrowStyle, CarouselBlockProps, CarouselTransition } from '../types'

export type CarouselStylePreset = 'slide' | 'fade' | 'cards' | 'coverflow'

type CarouselStyleOption = {
  value: CarouselStylePreset
  label: string
  icon: string
  description: string
}

/** The four carousel styles available from the palette / style switcher. */
export const CAROUSEL_STYLE_OPTIONS: CarouselStyleOption[] = [
  {
    value: 'slide',
    label: 'Slide',
    icon: 'ri-carousel-view',
    description: 'Classic one-at-a-time slides'
  },
  {
    value: 'fade',
    label: 'Fade',
    icon: 'ri-transition',
    description: 'Cross-fade between slides'
  },
  {
    value: 'cards',
    label: 'Cards',
    icon: 'ri-gallery-line',
    description: 'Multiple cards in view'
  },
  {
    value: 'coverflow',
    label: 'Coverflow',
    icon: 'ri-stack-line',
    description: '3D depth carousel'
  }
]

type StyleOverrides = Pick<
  CarouselBlockProps,
  | 'transition'
  | 'autoplay'
  | 'autoplayInterval'
  | 'slidesPerView'
  | 'slideGap'
  | 'slidePeek'
  | 'transitionDuration'
  | 'slideMinHeight'
  | 'arrowStyle'
>

const STYLE_OVERRIDES: Record<CarouselStylePreset, StyleOverrides> = {
  slide: {
    transition: 'slide',
    autoplay: true,
    autoplayInterval: 5000,
    slidesPerView: 1,
    slideGap: 16,
    slidePeek: 0,
    transitionDuration: 35,
    slideMinHeight: 280,
    arrowStyle: 'rounded'
  },
  fade: {
    transition: 'fade',
    autoplay: true,
    autoplayInterval: 6000,
    slidesPerView: 1,
    slideGap: 16,
    slidePeek: 0,
    transitionDuration: 45,
    slideMinHeight: 280,
    arrowStyle: 'rounded'
  },
  cards: {
    transition: 'slide',
    autoplay: false,
    autoplayInterval: 5000,
    slidesPerView: 3,
    slideGap: 24,
    slidePeek: 8,
    transitionDuration: 35,
    slideMinHeight: 220,
    arrowStyle: 'rounded'
  },
  coverflow: {
    transition: 'coverflow',
    autoplay: true,
    autoplayInterval: 5000,
    slidesPerView: 1,
    slideGap: 16,
    slidePeek: 18,
    transitionDuration: 40,
    slideMinHeight: 280,
    arrowStyle: 'floating'
  }
}

export function getCarouselStyleOverrides(style: CarouselStylePreset): StyleOverrides & { stylePreset: CarouselStylePreset } {
  return {
    stylePreset: style,
    ...STYLE_OVERRIDES[style]
  }
}

/** Infer which preset best matches current props (for older blocks without stylePreset). */
export function inferCarouselStylePreset(props: Partial<CarouselBlockProps>): CarouselStylePreset {
  if (props.stylePreset && CAROUSEL_STYLE_OPTIONS.some(option => option.value === props.stylePreset)) {
    return props.stylePreset
  }

  if (props.transition === 'coverflow') {
    return 'coverflow'
  }

  if (props.transition === 'fade') {
    return 'fade'
  }

  if ((props.slidesPerView ?? 1) > 1) {
    return 'cards'
  }

  return 'slide'
}

export function isCarouselStylePreset(value: unknown): value is CarouselStylePreset {
  return typeof value === 'string' && CAROUSEL_STYLE_OPTIONS.some(option => option.value === value)
}

export type { CarouselTransition, CarouselArrowStyle }
