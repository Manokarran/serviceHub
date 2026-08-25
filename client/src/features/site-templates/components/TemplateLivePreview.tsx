'use client'

import { useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { PublicSiteRenderer } from '@/features/your-space/components/PublicSiteRenderer'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'

const DESIGN_WIDTH = 1280
const BROWSER_CHROME_HEIGHT = 28

type Props = {
  blocks: Block[]
  siteStyles?: SiteStyles | null
  height?: number | string
  showBrowserChrome?: boolean

  /** `crop` clips a thumbnail. `scroll` shows a scaled desktop page you can scroll. */
  mode?: 'crop' | 'scroll'
}

export function TemplateLivePreview({
  blocks,
  siteStyles,
  height = 220,
  showBrowserChrome = true,
  mode = 'crop'
}: Props) {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [frameHeight, setFrameHeight] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [hasMoreBelow, setHasMoreBelow] = useState(false)

  useEffect(() => {
    const el = containerRef.current

    if (!el) {
      return
    }

    const resizeObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width

      if (width) {
        setContainerWidth(width)
      }
    })

    resizeObserver.observe(el)

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin: '120px', threshold: 0 }
    )

    intersectionObserver.observe(el)

    return () => {
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const el = frameRef.current

    if (!el || mode !== 'scroll') {
      return
    }

    const resizeObserver = new ResizeObserver(entries => {
      const nextHeight = entries[0]?.contentRect.height

      if (nextHeight) {
        setFrameHeight(nextHeight)
      }
    })

    resizeObserver.observe(el)

    return () => {
      resizeObserver.disconnect()
    }
  }, [mode, isVisible, containerWidth, blocks, siteStyles])

  const chromeHeight = showBrowserChrome ? BROWSER_CHROME_HEIGHT : 0
  const scale = containerWidth > 0 ? containerWidth / DESIGN_WIDTH : 0
  const shouldRender = isVisible && scale > 0
  const scaledHeight = frameHeight * scale

  useEffect(() => {
    const scroller = scrollRef.current

    if (!scroller || mode !== 'scroll') {
      setHasMoreBelow(false)

      return
    }

    const syncHint = () => {
      setHasMoreBelow(scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight > 12)
    }

    syncHint()

    const resizeObserver = new ResizeObserver(syncHint)

    resizeObserver.observe(scroller)

    return () => {
      resizeObserver.disconnect()
    }
  }, [scaledHeight, height, shouldRender, mode])

  const siteFrame = shouldRender ? (
    <Box
      ref={frameRef}
      aria-hidden
      sx={{
        width: DESIGN_WIDTH,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      <PublicSiteRenderer blocks={blocks} siteStyles={siteStyles} fillViewport={false} />
    </Box>
  ) : (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha(theme.palette.text.primary, 0.03)
      }}
    >
      <i className='ri-loader-4-line animate-spin text-xl text-textSecondary' />
    </Box>
  )

  const chrome = showBrowserChrome ? (
    <Box
      sx={{
        height: chromeHeight,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        flexShrink: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[0, 1, 2].map(dot => (
          <Box
            key={dot}
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.text.primary, 0.14)
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          flex: 1,
          height: 14,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.text.primary, 0.06),
          maxWidth: 180,
          display: 'flex',
          alignItems: 'center',
          px: 1
        }}
      >
        {mode === 'scroll' ? (
          <Typography variant='caption' color='text.disabled' sx={{ fontSize: 9, lineHeight: 1, letterSpacing: 0.2 }}>
            Desktop preview
          </Typography>
        ) : null}
      </Box>
    </Box>
  ) : null

  if (mode === 'scroll') {
    return (
      <Box
        ref={containerRef}
        sx={{
          height,
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.text.primary, 0.04),
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {chrome}
        <Box
          ref={scrollRef}
          onScroll={event => {
            const scroller = event.currentTarget

            setHasMoreBelow(scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight > 12)
          }}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowX: 'hidden',
            overflowY: 'auto',
            position: 'relative',
            scrollbarGutter: 'stable'
          }}
        >
          <Box sx={{ height: scaledHeight || '100%', position: 'relative', width: '100%' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0 }}>{siteFrame}</Box>
          </Box>
        </Box>
        {hasMoreBelow ? (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 56,
              pointerEvents: 'none',
              background: `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.background.paper, 0.92)} 100%)`,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              pb: 0.75
            }}
          >
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
              Scroll to see more
            </Typography>
          </Box>
        ) : null}
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height,
        overflow: 'clip',
        bgcolor: alpha(theme.palette.text.primary, 0.04),
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {chrome}
      <Box sx={{ flex: 1, overflow: 'clip', position: 'relative' }}>{siteFrame}</Box>
    </Box>
  )
}
