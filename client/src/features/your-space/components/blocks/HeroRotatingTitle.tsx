'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'

import type { HeroRotatingWordStyle } from '../../types'
import {
  getHeroRotatingWordHighlightSx,
  normalizeHeroRotatingWords,
  resolveHeroRotatingIntervalMs,
  resolveHeroRotatingWordStyle,
  splitHeroTitleAroundRotate
} from '../../utils/heroRotatingWords'

type Props = {
  title: string
  words: string[]
  intervalMs?: number
  wordStyle?: HeroRotatingWordStyle
  accentColor: string
  textColor: string
}

/**
 * Renders a hero title with `{rotate}` replaced by a slide-up word cycle.
 * Sized with an inline-grid so the slot matches the real font metrics and stays on the title baseline.
 */
export function HeroRotatingTitle({ title, words, intervalMs, wordStyle, accentColor, textColor }: Props) {
  const rotatingWords = normalizeHeroRotatingWords(words)
  const parts = splitHeroTitleAroundRotate(title)
  const [wordIndex, setWordIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(media.matches)

    sync()
    media.addEventListener('change', sync)

    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reduceMotion || rotatingWords.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setWordIndex(current => (current + 1) % rotatingWords.length)
    }, resolveHeroRotatingIntervalMs(intervalMs))

    return () => window.clearInterval(timer)
  }, [intervalMs, reduceMotion, rotatingWords.length])

  useEffect(() => {
    setWordIndex(0)
  }, [rotatingWords.join('\0')])

  if (!parts || rotatingWords.length === 0) {
    return <>{title}</>
  }

  const activeWord = rotatingWords[Math.min(wordIndex, rotatingWords.length - 1)] ?? rotatingWords[0]

  const highlightSx = getHeroRotatingWordHighlightSx(resolveHeroRotatingWordStyle(wordStyle), {
    accent: accentColor,
    text: textColor
  })

  const animate = !reduceMotion && rotatingWords.length > 1

  return (
    <>
      {parts.before}
      <Box
        component='span'
        aria-live='polite'
        sx={{
          display: 'inline-grid',
          verticalAlign: 'baseline',
          justifyItems: 'start',
          alignItems: 'baseline',
          perspective: '700px'
        }}
      >
        {/* Invisible copies reserve width for the longest word in the real heading font. */}
        {rotatingWords.map(word => (
          <Box
            key={`measure-${word}`}
            component='span'
            aria-hidden
            sx={{
              gridArea: '1 / 1',
              visibility: 'hidden',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {word}
          </Box>
        ))}
        <Box
          key={`${wordIndex}-${activeWord}`}
          component='span'
          sx={{
            gridArea: '1 / 1',
            whiteSpace: 'nowrap',
            transformOrigin: '50% 85%',
            ...highlightSx,
            ...(animate
              ? {
                  animation: 'heroWordSlideIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
                  '@keyframes heroWordSlideIn': {
                    from: { opacity: 0, transform: 'translate3d(0, 0.45em, 0) rotateX(-38deg)' },
                    to: { opacity: 1, transform: 'translate3d(0, 0, 0) rotateX(0deg)' }
                  }
                }
              : {})
          }}
        >
          {activeWord}
        </Box>
      </Box>
      {parts.after}
    </>
  )
}
