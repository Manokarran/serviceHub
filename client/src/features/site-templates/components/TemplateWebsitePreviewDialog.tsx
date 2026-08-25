'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { PublicSiteRenderer } from '@/features/your-space/components/PublicSiteRenderer'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'

export type TemplateWebsitePreviewPage = {
  slug: string
  title: string
  blocks: Block[]
  siteStyles?: SiteStyles | null
}

type Props = {
  open: boolean
  onClose: () => void
  title: string
  pages: TemplateWebsitePreviewPage[]
  initialPageSlug?: string
}

const DESIGN_WIDTH = 1280

function resolvePagesWithSharedStyles(pages: TemplateWebsitePreviewPage[]): TemplateWebsitePreviewPage[] {
  const sharedStyles = pages.find(page => page.slug === 'home')?.siteStyles ?? pages[0]?.siteStyles ?? null

  return pages.map(page => ({
    ...page,
    siteStyles: page.siteStyles ?? sharedStyles
  }))
}

export function TemplateWebsitePreviewDialog({ open, onClose, title, pages, initialPageSlug }: Props) {
  const theme = useTheme()
  const resolvedPages = useMemo(() => resolvePagesWithSharedStyles(pages), [pages])
  const [pageSlug, setPageSlug] = useState(initialPageSlug ?? resolvedPages[0]?.slug ?? 'home')

  useEffect(() => {
    if (!open) {
      return
    }

    const fallback = resolvedPages[0]?.slug ?? 'home'
    const nextSlug = initialPageSlug && resolvedPages.some(page => page.slug === initialPageSlug) ? initialPageSlug : fallback
    setPageSlug(nextSlug)
  }, [open, initialPageSlug, resolvedPages])

  const activePage = useMemo(() => {
    return resolvedPages.find(page => page.slug === pageSlug) ?? resolvedPages[0] ?? null
  }, [pageSlug, resolvedPages])

  if (!resolvedPages.length) {
    return null
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slotProps={{
        paper: {
          sx: {
            bgcolor: alpha(theme.palette.text.primary, 0.04),
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          flexShrink: 0
        }}
      >
        <IconButton aria-label='Close preview' onClick={onClose} edge='start'>
          <i className='ri-close-line' />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='subtitle1' className='font-semibold' noWrap>
            {title}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Scroll to review the full page before saving or publishing
          </Typography>
        </Box>
        {resolvedPages.length > 1 ? (
          <Tabs
            value={activePage?.slug ?? pageSlug}
            onChange={(_event, value: string) => setPageSlug(value)}
            variant='scrollable'
            scrollButtons='auto'
            sx={{ minHeight: 40, maxWidth: { xs: '100%', md: 420 } }}
          >
            {resolvedPages.map(page => (
              <Tab key={page.slug} value={page.slug} label={page.title || page.slug} sx={{ minHeight: 40, py: 0.5 }} />
            ))}
          </Tabs>
        ) : activePage ? (
          <Typography variant='body2' color='text.secondary' sx={{ display: { xs: 'none', sm: 'block' } }}>
            {activePage.title || activePage.slug}
          </Typography>
        ) : null}
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          py: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2 }
        }}
      >
        {activePage ? (
          <Box
            sx={{
              width: '100%',
              maxWidth: DESIGN_WIDTH,
              mx: 'auto',
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[6],
              bgcolor: 'background.paper'
            }}
          >
            <PublicSiteRenderer blocks={activePage.blocks} siteStyles={activePage.siteStyles} />
          </Box>
        ) : null}
      </Box>
    </Dialog>
  )
}
