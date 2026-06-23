'use client'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import type { EmblaCarouselType } from 'embla-carousel'

import type { CarouselArrowStyle, CarouselBlockProps, CarouselDotStyle } from '../../types'

type Props = {
  emblaApi: EmblaCarouselType | undefined
  props: CarouselBlockProps
  selectedIndex: number
  onSelect: (index: number) => void
}

function CarouselArrow({
  direction,
  style,
  color,
  onClick,
  floating
}: {
  direction: 'prev' | 'next'
  style: CarouselArrowStyle
  color: string
  onClick: () => void
  floating?: boolean
}) {
  const theme = useTheme()
  const icon = direction === 'prev' ? 'ri-arrow-left-s-line' : 'ri-arrow-right-s-line'
  const size = style === 'minimal' ? 36 : 40

  const floatingSx =
    floating && style === 'floating'
      ? {
          position: 'absolute' as const,
          top: '50%',
          ...(direction === 'prev' ? { left: 8 } : { right: 8 }),
          transform: 'translateY(-50%)',
          zIndex: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.14)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
        }
      : {}

  const inlineSx =
    !floating && style === 'rounded'
      ? {
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          border: `1px solid ${alpha(color, 0.18)}`,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`
        }
      : !floating && style === 'minimal'
        ? { backgroundColor: alpha(theme.palette.background.paper, 0.8) }
        : {}

  return (
    <IconButton
      size='small'
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous slide' : 'Next slide'}
      sx={{
        flexShrink: 0,
        color,
        width: size,
        height: size,
        ...(floating ? { pointerEvents: 'auto' } : {}),
        ...floatingSx,
        ...inlineSx
      }}
    >
      <i className={icon} style={{ fontSize: '1.25rem' }} />
    </IconButton>
  )
}

function CarouselDots({
  count,
  selectedIndex,
  style,
  color,
  onSelect
}: {
  count: number
  selectedIndex: number
  style: CarouselDotStyle
  color: string
  onSelect: (index: number) => void
}) {
  if (style === 'fraction') {
    return (
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: alpha(color, 0.85),
          letterSpacing: '0.04em',
          flexShrink: 0
        }}
      >
        {selectedIndex + 1} / {count}
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: style === 'lines' ? 0.5 : 0.75, flex: 1 }}>
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === selectedIndex

        return (
          <Box
            key={index}
            component='button'
            type='button'
            onClick={() => onSelect(index)}
            aria-label={`Go to slide ${index + 1}`}
            sx={{
              border: 'none',
              cursor: 'pointer',
              p: 0,
              transition: 'all 0.25s ease',
              flexShrink: 0,
              ...(style === 'lines'
                ? {
                    width: isActive ? 24 : 12,
                    height: 3,
                    borderRadius: 1,
                    backgroundColor: isActive ? color : alpha(color, 0.25)
                  }
                : {
                    width: isActive ? 10 : 8,
                    height: isActive ? 10 : 8,
                    borderRadius: '50%',
                    backgroundColor: isActive ? color : alpha(color, 0.3),
                    boxShadow: isActive ? `0 0 0 2px ${alpha(color, 0.2)}` : 'none'
                  })
            }}
          />
        )
      })}
    </Box>
  )
}

export function CarouselControls({ emblaApi, props, selectedIndex, onSelect }: Props) {
  const showArrows = props.showArrows && props.slides.length > 1
  const showDots = props.showDots && props.slides.length > 1
  const isFloating = props.arrowStyle === 'floating'

  if (!showArrows && !showDots) {
    return null
  }

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  const handleDotSelect = (index: number) => {
    onSelect(index)
    emblaApi?.scrollTo(index)
  }

  if (isFloating && showArrows) {
    return (
      <>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2
          }}
        >
          <CarouselArrow
            direction='prev'
            style={props.arrowStyle}
            color={props.arrowColor}
            onClick={scrollPrev}
            floating
          />
          <CarouselArrow
            direction='next'
            style={props.arrowStyle}
            color={props.arrowColor}
            onClick={scrollNext}
            floating
          />
        </Box>
        {showDots && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 1.5,
              px: 1,
              position: 'relative',
              zIndex: 2
            }}
          >
            <CarouselDots
              count={props.slides.length}
              selectedIndex={selectedIndex}
              style={props.dotStyle}
              color={props.dotColor}
              onSelect={handleDotSelect}
            />
          </Box>
        )}
      </>
    )
  }

  return (
    <Box sx={{ mt: 2, px: 0.5 }}>
      {showArrows && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minHeight: 44,
            px: 0.5
          }}
        >
          <CarouselArrow
            direction='prev'
            style={props.arrowStyle}
            color={props.arrowColor}
            onClick={scrollPrev}
          />
          {showDots ? (
            <CarouselDots
              count={props.slides.length}
              selectedIndex={selectedIndex}
              style={props.dotStyle}
              color={props.dotColor}
              onSelect={handleDotSelect}
            />
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
          <CarouselArrow
            direction='next'
            style={props.arrowStyle}
            color={props.arrowColor}
            onClick={scrollNext}
          />
        </Box>
      )}
      {showDots && !showArrows && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <CarouselDots
            count={props.slides.length}
            selectedIndex={selectedIndex}
            style={props.dotStyle}
            color={props.dotColor}
            onSelect={handleDotSelect}
          />
        </Box>
      )}
    </Box>
  )
}
