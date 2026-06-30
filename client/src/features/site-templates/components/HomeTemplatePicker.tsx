'use client'

import { useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { applySiteTemplateAction } from '@/app/actions/site-template.actions'
import { markSiteStartedAction } from '@/app/actions/site-workspace.actions'

import { usePublishedTemplates } from '../hooks/usePublishedTemplates'
import { TemplateGallery } from './TemplateGallery'

type Props = {
  isSiteStarted: boolean
}

export function HomeTemplatePicker({ isSiteStarted }: Props) {
  const theme = useTheme()
  const router = useRouter()
  const { templates, loading, hasTemplates } = usePublishedTemplates()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) {
      return
    }

    const timer = window.setTimeout(() => {
      router.refresh()
    }, 300)

    return () => window.clearTimeout(timer)
  }, [router, success])

  if (isSiteStarted || loading || !hasTemplates) {
    return null
  }

  const handleApply = async () => {
    if (!selectedId) {
      return
    }

    setApplying(true)
    setError(null)

    const result = await applySiteTemplateAction(selectedId)

    if (!result.success) {
      setError(result.error)
      setApplying(false)

      return
    }

    await markSiteStartedAction()
    setSuccess(true)
    setApplying(false)
  }

  if (success) {
    return (
      <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)` }}>
        <CardContent className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h6'>Template applied!</Typography>
            <Typography color='text.secondary'>
              Your workspace now has the selected layout. Open the builder to customize colors, copy, and sections.
            </Typography>
          </div>
          <Link href='/your-space' style={{ textDecoration: 'none' }}>
            <Button variant='contained' component='span' startIcon={<i className='ri-layout-masonry-line' />}>
              Open builder
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
        <CardContent className='flex flex-col gap-5'>
          <Box className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
            <div>
              <Typography variant='h6' className='mbe-1'>
                Choose your starting layout
              </Typography>
              <Typography color='text.secondary'>
                Pick a professionally designed template to bootstrap your site, or open the builder to start from
                scratch.
              </Typography>
            </div>
            <Box className='flex flex-wrap gap-2'>
              <Link href='/your-space?setup=1' style={{ textDecoration: 'none' }}>
                <Button variant='outlined' component='span' startIcon={<i className='ri-layout-grid-line' />}>
                  Browse templates
                </Button>
              </Link>
              <Link href='/your-space?aiSetup=1' style={{ textDecoration: 'none' }}>
                <Button variant='contained' color='secondary' component='span' startIcon={<i className='ri-magic-line' />}>
                  Start with AI
                </Button>
              </Link>
            </Box>
          </Box>

          {error ? <Alert severity='error'>{error}</Alert> : null}

          <TemplateGallery
            templates={templates}
            selectedId={selectedId}
            onSelect={setSelectedId}
            allowBlank={false}
            variant='featured'
            showCategoryFilter
            applying={applying}
            onApply={handleApply}
          />
        </CardContent>
      </Card>
  )
}
