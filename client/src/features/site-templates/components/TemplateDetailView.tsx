'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  archiveSiteTemplateAction,
  captureSiteTemplateFromWorkspaceAction,
  publishSiteTemplateAction,
  unpublishSiteTemplateAction,
  updateSiteTemplateAction
} from '@/app/actions/site-template.actions'
import {
  SITE_TEMPLATE_CATEGORIES,
  SITE_TEMPLATE_CATEGORY_LABELS,
  type SiteTemplateCategory
} from '@/lib/constants/site-template'
import {
  hasCustomTemplateThumbnail,
  hasGeneratedTemplateThumbnail,
  getTemplateThumbnailDisplayUrl
} from '@/lib/site-template/resolve-thumbnail'
import type { SiteTemplateDetail } from '@/models/site-template'

import { ThumbnailUploadField } from './ThumbnailUploadField'
import { TemplateWebsitePreviewDialog, type TemplateWebsitePreviewPage } from './TemplateWebsitePreviewDialog'

type Props = {
  template: SiteTemplateDetail
}

export function TemplateDetailView({ template: initialTemplate }: Props) {
  const router = useRouter()
  const [template, setTemplate] = useState(initialTemplate)
  const [name, setName] = useState(initialTemplate.name)
  const [description, setDescription] = useState(initialTemplate.description)
  const [category, setCategory] = useState<SiteTemplateCategory>(initialTemplate.category)
  const [thumbnailUrl, setThumbnailUrl] = useState(initialTemplate.thumbnailUrl ?? '')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const previewPages: TemplateWebsitePreviewPage[] = template.pages
    .filter(page => page.blocks.length > 0)
    .map(page => ({
      slug: page.slug,
      title: page.title,
      blocks: page.blocks,
      siteStyles: page.siteStyles ?? null
    }))

  const setStatusMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
  }

  const runAction = async (actionKey: string, action: () => Promise<void>) => {
    setBusyAction(actionKey)
    setMessage(null)

    try {
      await action()
    } finally {
      setBusyAction(null)
    }
  }

  const handleSave = async () => {
    await runAction('save', async () => {
      const result = await updateSiteTemplateAction(template.id, {
        name,
        description,
        category,
        thumbnailUrl: thumbnailUrl || ''
      })

      if (!result.success) {
        setStatusMessage('error', result.error)

        return
      }

      setTemplate(result.template)
      setThumbnailUrl(result.template.thumbnailUrl ?? '')
      setStatusMessage('success', 'Template details saved.')
    })
  }

  const handleCapture = async () => {
    await runAction('capture', async () => {
      const result = await captureSiteTemplateFromWorkspaceAction(template.id)

      if (!result.success) {
        setStatusMessage('error', result.error)

        return
      }

      setTemplate(result.template)
      setStatusMessage(
        'success',
        result.template.generatedThumbnailUrl
          ? `Captured ${result.template.pageCount} pages and updated the home page preview thumbnail.`
          : `Captured ${result.template.pageCount} pages from the master base template.`
      )
    })
  }

  const handlePublishToggle = async () => {
    const isPublished = template.status === 'published'

    await runAction('publish', async () => {
      const result = isPublished
        ? await unpublishSiteTemplateAction(template.id)
        : await publishSiteTemplateAction(template.id)

      if (!result.success) {
        setStatusMessage('error', result.error)

        return
      }

      setTemplate(result.template)
      setStatusMessage('success', isPublished ? 'Template unpublished.' : 'Template is now live in the gallery.')
    })
  }

  const handleArchive = async () => {
    if (!window.confirm('Archive this template? It will be hidden from the gallery.')) {
      return
    }

    await runAction('archive', async () => {
      const result = await archiveSiteTemplateAction(template.id)

      if (!result.success) {
        setStatusMessage('error', result.error)

        return
      }

      router.push('/super-admin/templates')
      router.refresh()
    })
  }

  return (
    <Box className='flex flex-col gap-6'>
      <Box className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <Link href='/super-admin/templates' className='text-primary text-sm flex items-center gap-1 mbe-2'>
            <i className='ri-arrow-left-line' />
            Back to templates
          </Link>
          <Typography variant='h4' className='mbe-1'>
            {template.name}
          </Typography>
          <Box className='flex flex-wrap items-center gap-2'>
            <Chip label={template.status} size='small' color={template.status === 'published' ? 'success' : 'default'} />
            <Chip label={SITE_TEMPLATE_CATEGORY_LABELS[template.category]} size='small' variant='tonal' />
            <Typography variant='body2' color='text.secondary'>
              {template.pageCount} pages · Used {template.usageCount} times
            </Typography>
          </Box>
        </div>
        <Box className='flex flex-wrap gap-2'>
          <Button
            variant='contained'
            startIcon={<i className='ri-edit-line' />}
            disabled={Boolean(busyAction)}
            component={Link}
            href={`/super-admin/templates/${template.id}/edit`}
          >
            Edit website
          </Button>
          <Button
            variant='outlined'
            startIcon={<i className='ri-eye-line' />}
            disabled={!previewPages.length || Boolean(busyAction)}
            onClick={() => setPreviewOpen(true)}
          >
            View website
          </Button>
          <Button
            variant='outlined'
            startIcon={<i className='ri-download-cloud-line' />}
            disabled={Boolean(busyAction)}
            onClick={() => void handleCapture()}
          >
            {busyAction === 'capture' ? 'Capturing…' : 'Capture from base template'}
          </Button>
          <Button
            variant='contained'
            color={template.status === 'published' ? 'warning' : 'success'}
            disabled={Boolean(busyAction)}
            onClick={() => void handlePublishToggle()}
          >
            {busyAction === 'publish'
              ? 'Updating…'
              : template.status === 'published'
                ? 'Unpublish'
                : 'Publish to gallery'}
          </Button>
        </Box>
      </Box>

      {message ? <Alert severity={message.type}>{message.text}</Alert> : null}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent className='flex flex-col gap-4'>
              <Typography variant='h6'>Template details</Typography>
              <TextField label='Name' value={name} onChange={event => setName(event.target.value)} fullWidth />
              <TextField
                label='Description'
                value={description}
                onChange={event => setDescription(event.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  label='Category'
                  value={category}
                  onChange={event => setCategory(event.target.value as SiteTemplateCategory)}
                >
                  {SITE_TEMPLATE_CATEGORIES.map(item => (
                    <MenuItem key={item} value={item}>
                      {SITE_TEMPLATE_CATEGORY_LABELS[item]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant='contained' disabled={busyAction === 'save'} onClick={() => void handleSave()}>
                {busyAction === 'save' ? 'Saving…' : 'Save details'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent className='flex flex-col gap-4'>
              <Typography variant='h6'>Thumbnail</Typography>
              <Box
                component='img'
                src={getTemplateThumbnailDisplayUrl(template, 640)}
                alt={`${template.name} preview`}
                sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}
              />
              <Box className='flex flex-wrap gap-2'>
                {hasCustomTemplateThumbnail(template) ? (
                  <Chip label='Custom upload' size='small' color='primary' variant='tonal' />
                ) : hasGeneratedTemplateThumbnail(template) ? (
                  <Chip label='Auto from home page' size='small' color='success' variant='tonal' />
                ) : (
                  <Chip label='Default placeholder' size='small' variant='outlined' />
                )}
              </Box>
              <Typography variant='body2' color='text.secondary'>
                Optional custom image. When you capture from workspace, a preview is generated from the live home page
                unless you upload your own thumbnail.
              </Typography>
              <ThumbnailUploadField
                value={thumbnailUrl}
                onChange={url => {
                  setThumbnailUrl(url)
                  setMessage(null)
                }}
                onError={text => setStatusMessage('error', text)}
              />
              {thumbnailUrl ? (
                <Button
                  size='small'
                  variant='text'
                  color='secondary'
                  onClick={() => {
                    setThumbnailUrl('')
                    setMessage(null)
                  }}
                >
                  Remove custom thumbnail
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent className='flex flex-col gap-3'>
          <Typography variant='h6'>Captured pages</Typography>
          {template.pages.length ? (
            <Box className='flex flex-col gap-2'>
              {template.pages.map(page => (
                <Box
                  key={page.slug}
                  className='flex items-center justify-between gap-3 p-3 rounded-lg'
                  sx={{ bgcolor: 'action.hover' }}
                >
                  <div>
                    <Typography className='font-medium'>{page.title}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      /{page.slug} · {page.blocks.length} blocks
                    </Typography>
                  </div>
                  {page.slug === 'home' ? <Chip label='Home + styles' size='small' color='primary' variant='tonal' /> : null}
                  <Button
                    size='small'
                    variant='text'
                    component={Link}
                    href={`/super-admin/templates/${template.id}/edit?p=${encodeURIComponent(page.slug)}`}
                    startIcon={<i className='ri-edit-line' />}
                  >
                    Edit
                  </Button>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color='text.secondary'>
              No pages captured yet. Click <strong>Edit website</strong> to design pages here, or capture from the{' '}
              <Link href='/super-admin/studio/builder' className='text-primary'>
                Base template builder
              </Link>
              .
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box className='flex justify-end'>
        <Button color='error' variant='outlined' disabled={Boolean(busyAction)} onClick={() => void handleArchive()}>
          Archive template
        </Button>
      </Box>

      <TemplateWebsitePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={template.name}
        pages={previewPages}
      />
    </Box>
  )
}
