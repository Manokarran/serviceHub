'use client'

import { useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'

import {
  getPagePatternPaint,
  pagePatternHoverOpacity,
  pagePatternLoadOpacity,
  type PagePatternId
} from '../constants/pagePatterns'
import { resolvePagePattern } from '../utils/pagePatternHelpers'
import { useSiteStyles } from './SiteStylesScope'

const SPOTLIGHT_MASK =
  'radial-gradient(circle 26vh at var(--mx, -800px) var(--my, -800px), #000 0%, rgba(0,0,0,0.7) 40%, transparent 72%)'

/**
 * Same idea as the landing lattice: faint lines on the page, and a soft light
 * that brightens those lines under the pointer. `glide` is how much of the
 * remaining distance the light covers each frame.
 */
function PatternSpotlight({
  backgroundImage,
  backgroundSize,
  opacity,
  glide = 0.035
}: {
  backgroundImage: string
  backgroundSize: string
  opacity: number
  glide?: number
}) {
  const shineRef = useRef<HTMLDivElement | null>(null)
  const [lit, setLit] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches

    if (reduce || coarse || opacity <= 0) {
      return
    }

    const node = shineRef.current

    if (!node) {
      return
    }

    const target = { x: -800, y: -800 }
    const current = { x: -800, y: -800 }
    const pointer = { x: 0, y: 0, valid: false }
    let frame = 0
    let primed = false
    let shown = false
    const easing = Math.min(1, Math.max(0.01, glide))

    const paint = () => {
      node.style.setProperty('--mx', `${current.x}px`)
      node.style.setProperty('--my', `${current.y}px`)
    }

    const readPointer = (clientX: number, clientY: number) => {
      const rect = node.getBoundingClientRect()

      target.x = clientX - rect.left
      target.y = clientY - rect.top
    }

    const tick = () => {
      current.x += (target.x - current.x) * easing
      current.y += (target.y - current.y) * easing
      paint()

      const dx = target.x - current.x
      const dy = target.y - current.y

      frame = dx * dx + dy * dy > 0.35 ? requestAnimationFrame(tick) : 0
    }

    const follow = () => {
      if (!primed || easing >= 1) {
        current.x = target.x
        current.y = target.y
        primed = true
        paint()
      } else if (!frame) {
        frame = requestAnimationFrame(tick)
      }

      if (!shown) {
        shown = true
        setLit(true)
      }
    }

    const place = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return
      }

      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.valid = true
      readPointer(event.clientX, event.clientY)
      follow()
    }

    const onScroll = () => {
      if (!pointer.valid) {
        return
      }

      readPointer(pointer.x, pointer.y)

      if (!frame) {
        frame = requestAnimationFrame(tick)
      }
    }

    const dim = () => {
      primed = false
      shown = false
      pointer.valid = false
      setLit(false)
    }

    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        dim()
      }
    }

    window.addEventListener('pointermove', place)
    document.addEventListener('pointerout', onOut)
    window.addEventListener('scroll', onScroll, true)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', place)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [glide, opacity])

  return (
    <Box
      ref={shineRef}
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage,
        backgroundSize,
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        opacity: lit ? opacity : 0,
        transition: lit ? 'opacity 0.3s ease' : 'opacity 0s',
        WebkitMaskImage: SPOTLIGHT_MASK,
        maskImage: SPOTLIGHT_MASK
      }}
    />
  )
}

export function PagePatternPreview({
  pattern,
  color,
  background,
  width = 52,
  height = 36
}: {
  pattern: PagePatternId
  color: string
  background: string
  width?: number | string
  height?: number | string
}) {
  const paint = getPagePatternPaint(pattern, color)

  return (
    <Box
      aria-hidden
      sx={{
        width,
        height,
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        backgroundColor: background,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {paint ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: paint.backgroundImage,
            backgroundSize: paint.backgroundSize,
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
            opacity: 0.7
          }}
        />
      ) : null}
    </Box>
  )
}

export function PagePatternLayer({ pageSlug }: { pageSlug: string }) {
  const siteStyles = useSiteStyles()
  const config = resolvePagePattern(siteStyles, pageSlug)
  const paint = getPagePatternPaint(config.pattern, siteStyles.colors.text)

  if (!paint) {
    return null
  }

  const loadOpacity = pagePatternLoadOpacity(config.loadStrength)
  const hoverOpacity = pagePatternHoverOpacity(config.hoverStrength)

  if (loadOpacity <= 0 && hoverOpacity <= 0) {
    return null
  }

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {loadOpacity > 0 ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: paint.backgroundImage,
            backgroundSize: paint.backgroundSize,
            backgroundRepeat: 'repeat',
            backgroundPosition: '0 0',
            opacity: loadOpacity
          }}
        />
      ) : null}
      {hoverOpacity > 0 ? (
        <PatternSpotlight
          backgroundImage={paint.backgroundImage}
          backgroundSize={paint.backgroundSize}
          opacity={hoverOpacity}
        />
      ) : null}
    </Box>
  )
}
