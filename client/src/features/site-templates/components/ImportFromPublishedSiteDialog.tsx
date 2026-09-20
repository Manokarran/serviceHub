'use client'

import { useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
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

import {
  importSiteTemplateFromPublishedTenantAction,
  listPublishedSitesForTemplateImportAction
} from '@/app/actions/site-template.actions'
import {
  SITE_TEMPLATE_CATEGORIES,
  SITE_TEMPLATE_CATEGORY_LABELS,
  type SiteTemplateCategory
} from '@/lib/constants/site-template'
import type { SiteTemplateSummary } from '@/models/site-template'
import type { PublishedSiteImportOption } from '@/services/site-template'

type Props = {
  open: boolean
  onClose: () => void
  onImported: (template: SiteTemplateSummary) => void
}

export function ImportFromPublishedSiteDialog({ open, onClose, onImported }: Props) {
  const [sites, setSites] = useState<PublishedSiteImportOption[]>([])
  const [selectedSite, setSelectedSite] = useState<PublishedSiteImportOption | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<SiteTemplateCategory>('business')
  const [error, setError] = useState<string | null>(null)
  const [loadingSites, setLoadingSites] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nameTouched, setNameTouched] = useState(false)

  const reset = () => {
    setSelectedSite(null)
    setName('')
    setDescription('')
    setCategory('business')
    setError(null)
    setNameTouched(false)
  }

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false

    const load = async () => {
      setLoadingSites(true)
      setError(null)

      const result = await listPublishedSitesForTemplateImportAction()

      if (cancelled) {
        return
      }

      if (!result.success) {
        setError(result.error)
        setSites([])
        setLoadingSites(false)

        return
      }

      setSites(result.sites)
      setLoadingSites(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open])

  const handleClose = () => {
    if (isSubmitting) {
      return
    }

    reset()
    onClose()
  }

  const handleSiteChange = (site: PublishedSiteImportOption | null) => {
    setSelectedSite(site)

    if (site && !nameTouched) {
      setName(site.isBaseTemplate ? 'Base template' : site.name)
    }
  }

  const siteOptions = useMemo(
    () =>
      sites.map(site => ({
        ...site,
        label: site.isBaseTemplate
          ? `${site.name} (master base)`
          : `${site.name} (${site.slug}) · ${site.pageCount} page${site.pageCount === 1 ? '' : 's'}`
      })),
    [sites]
  )

  const handleSubmit = async () => {
    if (!selectedSite) {
      setError('Select a published site to import.')

      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const result = await importSiteTemplateFromPublishedTenantAction({
        name,
        description,
        category,
        sourceTenantId: selectedSite.id
      })

      if (!result.success) {
        setError(result.error)
        setIsSubmitting(false)

        return
      }

      onImported(result.template)
      reset()
      onClose()
    } catch {
      setError('Failed to import site as template.')
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>Import from published site</DialogTitle>
      <DialogContent className='flex flex-col gap-4 pt-2'>
        {error ? <Alert severity='error'>{error}</Alert> : null}

        <Typography variant='body2' color='text.secondary'>
          Copy any live published website into the template library. Only published pages are imported. The new
          template starts as a draft until you publish it.
        </Typography>

        {loadingSites ? (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}
          >
            <CircularProgress size={18} /> Loading published sites…
          </Typography>
        ) : (
          <Autocomplete
            options={siteOptions}
            value={selectedSite ? siteOptions.find(option => option.id === selectedSite.id) ?? null : null}
            onChange={(_, value) => handleSiteChange(value)}
            getOptionLabel={option => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={isSubmitting || !siteOptions.length}
            renderInput={params => (
              <TextField
                {...params}
                label='Published site'
                placeholder='Search by org name or slug'
                required
              />
            )}
            noOptionsText='No published sites found'
          />
        )}

        <TextField
          label='Template name'
          value={name}
          onChange={event => {
            setNameTouched(true)
            setName(event.target.value)
          }}
          placeholder='e.g. PacIT Professional'
          fullWidth
          required
          disabled={isSubmitting}
        />
        <TextField
          label='Description'
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder='Short pitch shown in the template gallery'
          fullWidth
          multiline
          minRows={2}
          disabled={isSubmitting}
        />
        <FormControl fullWidth disabled={isSubmitting}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || loadingSites || !selectedSite || !name.trim()}
          startIcon={isSubmitting ? <CircularProgress size={16} color='inherit' /> : <i className='ri-download-2-line' />}
        >
          {isSubmitting ? 'Importing…' : 'Add to template list'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
