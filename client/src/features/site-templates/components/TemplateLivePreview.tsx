'use client'

import { useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

import { PublicSiteRenderer } from '@/features/your-space/components/PublicSiteRenderer'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'

const DESIGN_WIDTH = 1280
const BROWSER_CHROME_HEIGHT = 28

type Props = {
  blocks: Block[]
  siteStyles?: SiteStyles | null
  height?: number
  showBrowserChrome?: boolean
}

export function TemplateLivePreview({
  blocks,
  siteStyles,
  height = 220,
  showBrowserChrome = true
}: Props) {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

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

  const chromeHeight = showBrowserChrome ? BROWSER_CHROME_HEIGHT : 0
  const scale = containerWidth > 0 ? containerWidth / DESIGN_WIDTH : 0
  const shouldRender = isVisible && scale > 0

  return (
    <Box
      ref={containerRef}
      sx={{
        height,
        overflow: 'hidden',
        bgcolor: alpha(theme.palette.text.primary, 0.04),
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {showBrowserChrome ? (
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
              maxWidth: 140
            }}
          />
        </Box>
      ) : null}

      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {shouldRender ? (
          <Box
            aria-hidden
            sx={{
              width: DESIGN_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            <PublicSiteRenderer blocks={blocks} siteStyles={siteStyles} />
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
        )}
      </Box>
    </Box>
  )
}
