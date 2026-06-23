import type { SxProps, Theme } from '@mui/material/styles'

import type { CarouselBlockProps, CarouselTransition } from '../types'

const MAX_WIDTH_MAP = {
  sm: 640,
  md: 768,
  lg: 1024,
  full: '100%'
} as const

export function getCarouselMaxWidth(maxWidth: CarouselBlockProps['maxWidth']) {
  return MAX_WIDTH_MAP[maxWidth]
}

export function getCarouselSlideFlexBasis(slidesPerView: number, gap: number, peek: number): string {
  if (slidesPerView <= 1) {
    const peekOffset = peek > 0 ? peek : 0

    return `calc(${100 - peekOffset}% - ${gap}px)`
  }

  const basis = 100 / slidesPerView

  return `calc(${basis}% - ${(gap * (slidesPerView - 1)) / slidesPerView}px)`
}

export function getCarouselTransitionClass(transition: CarouselTransition, selected: boolean): string {
  if (transition === 'scale') {
    return selected ? 'carousel-slide-scale-active' : 'carousel-slide-scale-inactive'
  }

  if (transition === 'coverflow') {
    return selected ? 'carousel-slide-coverflow-active' : 'carousel-slide-coverflow-inactive'
  }

  return ''
}

export function getCarouselShellSx(props: CarouselBlockProps): SxProps<Theme> {
  return {
    py: `${props.paddingY}px`,
    px: `${props.paddingX}px`
  }
}

export function getCarouselViewportSx(props: CarouselBlockProps): SxProps<Theme> {
  return {
    borderRadius: props.borderRadius
  }
}

export function getCarouselSlideSx(
  props: CarouselBlockProps,
  isEditMode: boolean
): SxProps<Theme> {
  const flexBasis = getCarouselSlideFlexBasis(props.slidesPerView, props.slideGap, props.slidePeek)

  return {
    flex: `0 0 ${flexBasis}`,
    minWidth: 0,
    minHeight: props.slideMinHeight,
    mr: `${props.slideGap}px`,
    borderRadius: Math.max(0, props.borderRadius - 4),
    overflow: 'hidden',
    transition: isEditMode ? undefined : `transform ${props.transitionDuration * 10}ms ease, opacity ${props.transitionDuration * 10}ms ease`,
    '@keyframes carousel-scale-in': {
      from: { transform: 'scale(0.92)', opacity: 0.6 },
      to: { transform: 'scale(1)', opacity: 1 }
    }
  }
}

export const CAROUSEL_TRANSITION_OPTIONS = [
  { value: 'slide' as const, label: 'Slide', icon: 'ri-arrow-left-right-line' },
  { value: 'fade' as const, label: 'Fade', icon: 'ri-transition' },
  { value: 'scale' as const, label: 'Scale', icon: 'ri-zoom-in-line' },
  { value: 'coverflow' as const, label: 'Coverflow', icon: 'ri-stack-line' }
]

export const CAROUSEL_ARROW_STYLE_OPTIONS = [
  { value: 'minimal' as const, label: 'Minimal', icon: 'ri-subtract-line' },
  { value: 'rounded' as const, label: 'Rounded', icon: 'ri-checkbox-blank-line' },
  { value: 'floating' as const, label: 'Floating', icon: 'ri-bubble-chart-line' }
]

export const CAROUSEL_DOT_STYLE_OPTIONS = [
  { value: 'dots' as const, label: 'Dots', icon: 'ri-record-circle-line' },
  { value: 'lines' as const, label: 'Lines', icon: 'ri-more-line' },
  { value: 'fraction' as const, label: 'Fraction', icon: 'ri-hashtag' }
]
