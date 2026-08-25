'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

import { getSiteTemplateAction } from '@/app/actions/site-template.actions'
import type { SiteTemplateSummary } from '@/models/site-template'

import { CreateTemplateDialog } from './CreateTemplateDialog'
import { TemplateGallery } from './TemplateGallery'
import { TemplateWebsitePreviewDialog, type TemplateWebsitePreviewPage } from './TemplateWebsitePreviewDialog'

type Props = {
  initialTemplates: SiteTemplateSummary[]
}

export function SuperAdminTemplatesView({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewPages, setPreviewPages] = useState<TemplateWebsitePreviewPage[]>([])
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const openTemplatePreview = async (templateId: string) => {
    setPreviewLoading(true)
    setPreviewError(null)

    const result = await getSiteTemplateAction(templateId)

    if (!result.success) {
      setPreviewError(result.error)
      setPreviewLoading(false)

      return
    }

    const pages = result.template.pages
      .filter(page => page.blocks.length > 0)
      .map(page => ({
        slug: page.slug,
        title: page.title,
        blocks: page.blocks,
        siteStyles: page.siteStyles ?? null
      }))

    if (!pages.length) {
      setPreviewError('This template has no pages to preview yet.')
      setPreviewLoading(false)

      return
    }

    setPreviewTitle(result.template.name)
    setPreviewPages(pages)
    setPreviewOpen(true)
    setPreviewLoading(false)
  }

  return (
    <Box className='flex flex-col gap-6'>
      <Box className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <Typography variant='h4' className='mbe-1'>
            Website templates
          </Typography>
          <Typography color='text.secondary'>
            Websites saved from Design studio. Publish a draft so users can choose it, or they can generate their own
            from the same engine.
          </Typography>
        </div>
        <Box className='flex flex-wrap gap-2'>
          <Link href='/super-admin/studio' style={{ textDecoration: 'none' }}>
            <Button variant='outlined' startIcon={<i className='ri-palette-line' />}>
              Open studio
            </Button>
          </Link>
          <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setDialogOpen(true)}>
            New blank template
          </Button>
        </Box>
      </Box>

      <Alert severity='info' icon={<i className='ri-lightbulb-line' />}>
        Preferred path: design Home, About, and Contact in the{' '}
        <Link href='/super-admin/studio/builder' className='text-primary font-medium'>
          Base template builder
        </Link>
        , generate branded variations in{' '}
        <Link href='/super-admin/studio' className='text-primary font-medium'>
          Design studio
        </Link>
        , then publish from this library. You can still capture the latest base template into a blank template.
      </Alert>

      {previewError ? (
        <Alert severity='error' onClose={() => setPreviewError(null)}>
          {previewError}
        </Alert>
      ) : null}

      {templates.length ? (
        <TemplateGallery
          templates={templates}
          showStatus
          allowBlank={false}
          getTemplateHref={id => `/super-admin/templates/${id}`}
          onPreviewTemplate={templateId => void openTemplatePreview(templateId)}
        />
      ) : (
        <Box
          className='flex flex-col items-center justify-center gap-3 p-12 rounded-xl'
          sx={{ border: theme => `2px dashed ${theme.palette.divider}`, bgcolor: 'action.hover' }}
        >
          <i className='ri-layout-grid-line text-5xl text-textSecondary' />
          <Typography variant='h6'>No templates yet</Typography>
          <Typography color='text.secondary' className='text-center max-is-[420px]'>
            Create your first website template. Users will see published templates in the gallery when they register.
          </Typography>
          <Button variant='contained' onClick={() => setDialogOpen(true)}>
            Create first template
          </Button>
        </Box>
      )}

      <CreateTemplateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={template => {
          setTemplates(current => [...current, template])
          window.location.assign(`/super-admin/templates/${template.id}`)
        }}
      />

      <TemplateWebsitePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        pages={previewPages}
      />

      {previewLoading ? (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: theme => theme.zIndex.modal + 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(15, 23, 42, 0.24)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, borderRadius: 3, bgcolor: 'background.paper', p: 6, boxShadow: 6 }}>
            <i className='ri-loader-4-line text-3xl text-primary animate-spin' />
            <Typography color='text.secondary'>Loading website preview…</Typography>
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}
