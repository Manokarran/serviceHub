'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { createSiteTemplateAction } from '@/app/actions/site-template.actions'
import {
  SITE_TEMPLATE_CATEGORIES,
  SITE_TEMPLATE_CATEGORY_LABELS,
  type SiteTemplateCategory
} from '@/lib/constants/site-template'
import type { SiteTemplateSummary } from '@/models/site-template'

import { ThumbnailUploadField } from './ThumbnailUploadField'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (template: SiteTemplateSummary) => void
}

export function CreateTemplateDialog({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<SiteTemplateCategory>('business')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = () => {
    setName('')
    setDescription('')
    setCategory('business')
    setThumbnailUrl('')
    setError(null)
  }

  const handleClose = () => {
    if (isSubmitting) {
      return
    }

    reset()
    onClose()
  }

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await createSiteTemplateAction({
        name,
        description,
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
        category
      })

      if (!result.success) {
        setError(result.error)
        setIsSubmitting(false)

        return
      }

      onCreated(result.template)
      reset()
      onClose()
    } catch {
      setError('Failed to create template.')
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>Create website template</DialogTitle>
      <DialogContent className='flex flex-col gap-4 pt-2'>
        {error ? <Alert severity='error'>{error}</Alert> : null}
        <TextField
          autoFocus
          label='Template name'
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder='e.g. Modern Agency'
          fullWidth
          required
        />
        <TextField
          label='Description'
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder='Short pitch shown in the template gallery'
          fullWidth
          multiline
          minRows={2}
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
        <ThumbnailUploadField value={thumbnailUrl} onChange={setThumbnailUrl} onError={setError} />
        <Typography variant='caption' color='text.secondary'>
          Optional. A default placeholder is used until you capture your workspace — then the home page preview is
          generated automatically.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant='contained' onClick={() => void handleSubmit()} disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? 'Creating…' : 'Create template'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
