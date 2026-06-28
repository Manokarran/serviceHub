'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

import type { SiteTemplateSummary } from '@/models/site-template'

import { CreateTemplateDialog } from './CreateTemplateDialog'
import { TemplateGallery } from './TemplateGallery'

type Props = {
  initialTemplates: SiteTemplateSummary[]
}

export function SuperAdminTemplatesView({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Box className='flex flex-col gap-6'>
      <Box className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <Typography variant='h4' className='mbe-1'>
            Website templates
          </Typography>
          <Typography color='text.secondary'>
            Create ready-made websites for users to pick when they sign up. Build in Your Space, then capture your
            workspace into a template.
          </Typography>
        </div>
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setDialogOpen(true)}>
          New template
        </Button>
      </Box>

      <Alert severity='info' icon={<i className='ri-lightbulb-line' />}>
        Workflow: create a template → build pages in{' '}
        <Link href='/your-space' className='text-primary font-medium'>
          Your Space
        </Link>{' '}
        → open the template → <strong>Capture from workspace</strong> → publish when ready.
      </Alert>

      {templates.length ? (
        <TemplateGallery
          templates={templates}
          showStatus
          allowBlank={false}
          getTemplateHref={id => `/super-admin/templates/${id}`}
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
    </Box>
  )
}
