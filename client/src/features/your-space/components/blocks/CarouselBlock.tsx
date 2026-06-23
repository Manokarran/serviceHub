'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'

import type { Block, CarouselBlockProps } from '../../types'
import { createBlockId } from '../../utils/blockFactory'
import {
  getCarouselSlideFlexBasis,
  getCarouselShellSx,
  getCarouselSlideSx,
  getCarouselViewportSx
} from '../../utils/carouselStyleHelpers'
import { CarouselDropZone } from '../dnd/CarouselDropZone'
import { CarouselEditChip } from '../inline/CarouselEditChip'
import { useBuilderOptional } from '../../context/BuilderContext'
import { CarouselControls } from './CarouselControls'

const MAX_WIDTH_MAP = {
  sm: 640,
  md: 768,
  lg: 1024,
  full: '100%'
} as const

type Props = {
  block: Block
  preview?: boolean
}

function SlideTabs({
  slides,
  activeIndex,
  onSelect,
  onAdd,
  onRemove
}: {
  slides: CarouselBlockProps['slides']
  activeIndex: number
  onSelect: (index: number) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        mb: 1.5,
        flexWrap: 'wrap'
      }}
    >
      {slides.map((slide, index) => (
        <Box
          key={slide.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25
          }}
        >
          <Box
            component='button'
            type='button'
            onClick={() => onSelect(index)}
            sx={{
              border: 'none',
              cursor: 'pointer',
              px: 1.25,
              py: 0.375,
              borderRadius: 1,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: activeIndex === index ? 'primary.main' : 'text.secondary',
              backgroundColor:
                activeIndex === index ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.text.primary, 0.04),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08)
              }
            }}
          >
            Slide {index + 1}
          </Box>
          {slides.length > 1 && (
            <Box
              component='button'
              type='button'
              onClick={() => onRemove(index)}
              aria-label={`Remove slide ${index + 1}`}
              sx={{
                border: 'none',
                cursor: 'pointer',
                width: 20,
                height: 20,
                borderRadius: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.disabled',
                backgroundColor: 'transparent',
                '&:hover': { color: 'error.main', backgroundColor: alpha(theme.palette.error.main, 0.08) }
              }}
            >
              <i className='ri-close-line' style={{ fontSize: '0.75rem' }} />
            </Box>
          )}
        </Box>
      ))}
      <Box
        component='button'
        type='button'
        onClick={onAdd}
        sx={{
          border: 'none',
          cursor: 'pointer',
          px: 1,
          py: 0.375,
          borderRadius: 1,
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'text.secondary',
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          '&:hover': {
            color: 'primary.main',
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
          }
        }}
      >
        <i className='ri-add-line' style={{ fontSize: '0.8rem' }} />
        Add slide
      </Box>
    </Box>
  )
}

function CarouselShell({ block, preview }: Props) {
  const theme = useTheme()
  const builder = useBuilderOptional()
  const props = block.props as CarouselBlockProps
  const editMode = !preview
  const maxWidth = MAX_WIDTH_MAP[props.maxWidth]
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [selectedSnap, setSelectedSnap] = useState(0)

  const plugins = useMemo(() => {
    if (editMode) {
      return []
    }

    const list = []

    if (props.autoplay) {
      list.push(
        Autoplay({
          delay: props.autoplayInterval,
          stopOnInteraction: false,
          stopOnMouseEnter: true
        })
      )
    }

    if (props.transition === 'fade') {
      list.push(Fade())
    }

    return list
  }, [editMode, props.autoplay, props.autoplayInterval, props.transition])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: props.loop,
      duration: props.transitionDuration,
      align: props.slidePeek > 0 || props.slidesPerView > 1 ? 'center' : 'start',
      containScroll: props.transition === 'coverflow' ? false : 'trimSnaps',
      slidesToScroll: 1
    },
    plugins
  )

  const onSelectSnap = useCallback(() => {
    if (!emblaApi) {
      return
    }

    setSelectedSnap(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    onSelectSnap()
    emblaApi.on('select', onSelectSnap)
    emblaApi.on('reInit', onSelectSnap)

    return () => {
      emblaApi.off('select', onSelectSnap)
      emblaApi.off('reInit', onSelectSnap)
    }
  }, [emblaApi, onSelectSnap])

  useEffect(() => {
    if (activeSlideIndex >= props.slides.length) {
      setActiveSlideIndex(Math.max(0, props.slides.length - 1))
    }
  }, [activeSlideIndex, props.slides.length])

  const activeSlide = props.slides[activeSlideIndex] ?? props.slides[0]
  const flexBasis = getCarouselSlideFlexBasis(props.slidesPerView, props.slideGap, props.slidePeek)

  const handleAddSlide = () => {
    if (!builder) {
      return
    }

    const newSlide = { id: createBlockId(), children: [] }
    const nextSlides = [...props.slides, newSlide]

    builder.updateBlock(block.id, { slides: nextSlides })
    setActiveSlideIndex(nextSlides.length - 1)
  }

  const handleRemoveSlide = (index: number) => {
    if (!builder || props.slides.length <= 1) {
      return
    }

    const nextSlides = props.slides.filter((_, i) => i !== index)

    builder.updateBlock(block.id, { slides: nextSlides })
    setActiveSlideIndex(Math.min(activeSlideIndex, nextSlides.length - 1))
  }

  const getSlideTransform = (index: number) => {
    if (editMode || props.transition === 'fade') {
      return undefined
    }

    const distance = index - selectedSnap

    if (props.transition === 'scale') {
      const scale = distance === 0 ? 1 : 0.88
      const opacity = distance === 0 ? 1 : 0.55

      return { transform: `scale(${scale})`, opacity }
    }

    if (props.transition === 'coverflow') {
      const rotate = distance * -12
      const translateX = distance * 8
      const scale = distance === 0 ? 1 : 0.82
      const opacity = distance === 0 ? 1 : 0.45
      const zIndex = distance === 0 ? 2 : 1

      return {
        transform: `perspective(900px) rotateY(${rotate}deg) translateX(${translateX}%) scale(${scale})`,
        opacity,
        zIndex
      }
    }

    return undefined
  }

  return (
    <Box
      component='section'
      sx={{
        position: 'relative',
        ...getCarouselShellSx(props)
      }}
    >
      {editMode && <CarouselEditChip carouselId={block.id} />}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: typeof maxWidth === 'number' ? maxWidth : maxWidth,
          mx: props.maxWidth === 'full' ? 0 : 'auto'
        }}
      >
        {editMode && (
          <SlideTabs
            slides={props.slides}
            activeIndex={activeSlideIndex}
            onSelect={setActiveSlideIndex}
            onAdd={handleAddSlide}
            onRemove={handleRemoveSlide}
          />
        )}

        <Box
          sx={{
            position: 'relative',
            overflow: 'visible',
            ...getCarouselViewportSx(props),
            backgroundColor: alpha(theme.palette.text.primary, editMode ? 0.03 : 0),
            ...(props.showArrows && props.arrowStyle === 'floating' && !editMode
              ? { px: 0.5 }
              : {})
          }}
        >
          {editMode ? (
            <Box sx={{ minHeight: props.slideMinHeight, p: 1 }}>
              {activeSlide && (
                <CarouselDropZone
                  carouselId={block.id}
                  slideId={activeSlide.id}
                  children={activeSlide.children}
                  editMode
                  emptyLabel='Drop heading, text, button, image, video, or logo blocks here'
                />
              )}
            </Box>
          ) : (
            <>
              <Box sx={{ position: 'relative', overflow: 'visible' }}>
                <Box
                  ref={emblaRef}
                  sx={{
                    overflow: 'hidden',
                    borderRadius: props.borderRadius
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      ...(props.transition === 'fade' ? { position: 'relative' } : {}),
                      ml: props.slidePeek > 0 ? `${props.slidePeek / 2}%` : 0
                    }}
                  >
                    {props.slides.map((slide, index) => (
                      <Box
                        key={slide.id}
                        className='embla__slide'
                        sx={{
                          ...getCarouselSlideSx(props, false),
                          flex: props.transition === 'fade' ? '0 0 100%' : `0 0 ${flexBasis}`,
                          ...(props.transition === 'fade' && index !== selectedSnap
                            ? {
                                opacity: 0,
                                pointerEvents: 'none'
                              }
                            : {}),
                          ...getSlideTransform(index)
                        }}
                      >
                        <Box
                          sx={{
                            minHeight: props.slideMinHeight,
                            p: 2,
                            backgroundColor: alpha(theme.palette.background.paper, 0.6),
                            borderRadius: Math.max(0, props.borderRadius - 4),
                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <CarouselDropZone
                            carouselId={block.id}
                            slideId={slide.id}
                            children={slide.children}
                            editMode={false}
                            emptyLabel=''
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
                {props.showArrows && props.arrowStyle === 'floating' && (
                  <CarouselControls
                    emblaApi={emblaApi}
                    props={props}
                    selectedIndex={selectedSnap}
                    onSelect={setSelectedSnap}
                  />
                )}
              </Box>
              {props.arrowStyle !== 'floating' && (
                <CarouselControls
                  emblaApi={emblaApi}
                  props={props}
                  selectedIndex={selectedSnap}
                  onSelect={setSelectedSnap}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export function CarouselBlock({ block, preview = false }: Props) {
  return <CarouselShell block={block} preview={preview} />
}

export function CarouselBlockPreview({ block }: { block: Block }) {
  return <CarouselShell block={block} preview />
}
