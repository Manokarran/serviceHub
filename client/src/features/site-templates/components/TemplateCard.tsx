'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { alpha, useTheme } from '@mui/material/styles'

import { SITE_TEMPLATE_CATEGORY_LABELS } from '@/lib/constants/site-template'
import { getTemplateThumbnailDisplayUrl } from '@/lib/site-template/resolve-thumbnail'
import type { SiteTemplateSummary } from '@/models/site-template'

import { TemplateLivePreview } from './TemplateLivePreview'

type Props = {
  template: SiteTemplateSummary
  selected?: boolean
  onSelect?: (templateId: string) => void
  showStatus?: boolean
  href?: string
  variant?: 'default' | 'featured'
}

export function TemplateCard({
  template,
  selected = false,
  onSelect,
  showStatus = false,
  href,
  variant = 'default'
}: Props) {
  const theme = useTheme()
  const thumbnail = getTemplateThumbnailDisplayUrl(template, variant === 'featured' ? 640 : 480)
  const previewHeight = variant === 'featured' ? 220 : 180
  const hasLivePreview = Boolean(template.homePreview?.blocks.length)

  const preview = hasLivePreview ? (
    <TemplateLivePreview
      blocks={template.homePreview!.blocks}
      siteStyles={template.homePreview!.siteStyles}
      height={previewHeight}
    />
  ) : (
    <Box
      component='img'
      src={thumbnail}
      alt={template.name}
      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )

  const content = (
    <>
      <Box
        sx={{
          position: 'relative',
          height: previewHeight,
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.primary.main, 0.06)
        }}
      >
        {preview}
        {selected ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.55)
            }}
          >
            <i className='ri-check-line text-4xl text-white' />
          </Box>
        ) : null}
        {showStatus ? (
          <Chip
            label={template.status}
            size='small'
            color={template.status === 'published' ? 'success' : 'default'}
            sx={{ position: 'absolute', top: 12, right: 12, textTransform: 'capitalize' }}
          />
        ) : null}
      </Box>
      <CardContent className='flex flex-col gap-2'>
        <div className='flex items-start justify-between gap-2'>
          <Typography variant='subtitle1' className='font-semibold line-clamp-1'>
            {template.name}
          </Typography>
          <Chip
            label={SITE_TEMPLATE_CATEGORY_LABELS[template.category]}
            size='small'
            variant='tonal'
            color='primary'
          />
        </div>
        {template.description ? (
          <Typography variant='body2' color='text.secondary' className='line-clamp-2'>
            {template.description}
          </Typography>
        ) : null}
        <Typography variant='caption' color='text.disabled'>
          {template.pageCount} page{template.pageCount === 1 ? '' : 's'}
          {showStatus ? ` · Used ${template.usageCount} times` : ''}
        </Typography>
      </CardContent>
    </>
  )

  if (!onSelect) {
    const card = <Card sx={{ height: '100%' }}>{content}</Card>

    if (href) {
      return (
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
          {card}
        </Link>
      )
    }

    return card
  }

  return (
    <Card
      sx={{
        height: '100%',
        border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
        boxShadow: selected ? theme.shadows[4] : theme.shadows[0],
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          borderColor: selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.4),
          boxShadow: theme.shadows[3],
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardActionArea onClick={() => onSelect(template.id)} sx={{ height: '100%', alignItems: 'stretch' }}>
        {content}
      </CardActionArea>
    </Card>
  )
}
