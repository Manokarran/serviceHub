'use client'

import { useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  SITE_TEMPLATE_CATEGORIES,
  SITE_TEMPLATE_CATEGORY_LABELS,
  type SiteTemplateCategory
} from '@/lib/constants/site-template'
import type { SiteTemplateSummary } from '@/models/site-template'

import { TemplateCard } from './TemplateCard'

type Props = {
  templates: SiteTemplateSummary[]
  selectedId?: string | null
  onSelect?: (templateId: string | null) => void
  allowBlank?: boolean
  showStatus?: boolean
  showCategoryFilter?: boolean
  variant?: 'default' | 'featured'
  getTemplateHref?: (templateId: string) => string
  loading?: boolean
  applying?: boolean
  onApply?: (templateId: string) => void
}

export function TemplateGallery({
  templates,
  selectedId = null,
  onSelect,
  allowBlank = true,
  showStatus = false,
  showCategoryFilter = false,
  variant = 'default',
  getTemplateHref,
  loading = false,
  applying = false,
  onApply
}: Props) {
  const theme = useTheme()
  const [category, setCategory] = useState<SiteTemplateCategory | 'all'>('all')

  const filteredTemplates = useMemo(() => {
    if (category === 'all') {
      return templates
    }

    return templates.filter(template => template.category === category)
  }, [category, templates])

  const categoriesInUse = useMemo(() => {
    const used = new Set(templates.map(template => template.category))

    return SITE_TEMPLATE_CATEGORIES.filter(item => used.has(item))
  }, [templates])

  const gridSize =
    variant === 'featured'
      ? { xs: 12, sm: 6, lg: 4 }
      : { xs: 12, sm: 6, md: 4 }

  if (!templates.length && !allowBlank) {
    return <Alert severity='info'>No website templates are available yet.</Alert>
  }

  return (
    <Box className='flex flex-col gap-4'>
      {showCategoryFilter && categoriesInUse.length ? (
        <Box className='flex flex-col gap-2'>
          <Typography variant='body2' color='text.secondary' className='font-medium'>
            Filter by category
          </Typography>
          <Box className='flex flex-wrap gap-2'>
            <Chip
              label='All templates'
              clickable
              color={category === 'all' ? 'primary' : 'default'}
              variant={category === 'all' ? 'filled' : 'outlined'}
              onClick={() => setCategory('all')}
            />
            {categoriesInUse.map(item => (
              <Chip
                key={item}
                label={SITE_TEMPLATE_CATEGORY_LABELS[item]}
                clickable
                color={category === item ? 'primary' : 'default'}
                variant={category === item ? 'filled' : 'outlined'}
                onClick={() => setCategory(item)}
              />
            ))}
          </Box>
        </Box>
      ) : categoriesInUse.length > 1 ? (
        <Box className='flex flex-wrap gap-2'>
          <Chip
            label='All'
            clickable
            color={category === 'all' ? 'primary' : 'default'}
            variant={category === 'all' ? 'filled' : 'outlined'}
            onClick={() => setCategory('all')}
          />
          {categoriesInUse.map(item => (
            <Chip
              key={item}
              label={SITE_TEMPLATE_CATEGORY_LABELS[item]}
              clickable
              color={category === item ? 'primary' : 'default'}
              variant={category === item ? 'filled' : 'outlined'}
              onClick={() => setCategory(item)}
            />
          ))}
        </Box>
      ) : null}

      <Grid container spacing={variant === 'featured' ? 3 : 3}>
        {allowBlank && onSelect ? (
          <Grid size={gridSize}>
            <Box
              onClick={() => onSelect(null)}
              sx={{
                height: '100%',
                minHeight: variant === 'featured' ? 320 : 280,
                borderRadius: 2,
                border: theme =>
                  selectedId === null
                    ? `2px solid ${theme.palette.primary.main}`
                    : `2px dashed ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                p: 4,
                cursor: 'pointer',
                bgcolor: selectedId === null ? alpha(theme.palette.primary.main, 0.04) : 'action.hover',
                transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
                boxShadow: selectedId === null ? theme.shadows[2] : 'none',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.06)
                }
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.text.primary, 0.06)
                }}
              >
                <i className='ri-brush-line text-3xl text-textSecondary' />
              </Box>
              <Typography variant='subtitle1' className='font-semibold'>
                Start from scratch
              </Typography>
              <Typography variant='body2' color='text.secondary' className='text-center max-is-[240px]'>
                Begin with a minimal starter layout and build every section yourself.
              </Typography>
            </Box>
          </Grid>
        ) : null}

        {filteredTemplates.map(template => (
          <Grid key={template.id} size={gridSize}>
            <TemplateCard
              template={template}
              selected={selectedId === template.id}
              onSelect={onSelect}
              showStatus={showStatus}
              href={getTemplateHref?.(template.id)}
              variant={variant}
            />
          </Grid>
        ))}
      </Grid>

      {filteredTemplates.length === 0 && category !== 'all' ? (
        <Alert severity='info' variant='outlined'>
          No templates in the <strong>{SITE_TEMPLATE_CATEGORY_LABELS[category]}</strong> category yet. Try another
          category or start from scratch.
        </Alert>
      ) : null}

      {onApply && selectedId ? (
        <Box className='flex justify-end'>
          <Button variant='contained' disabled={applying || loading} onClick={() => onApply(selectedId)}>
            {applying ? 'Applying template…' : 'Use this template'}
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}
