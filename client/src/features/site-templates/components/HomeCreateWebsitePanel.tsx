'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import Link from 'next/link'

import { usePublishedTemplates } from '../hooks/usePublishedTemplates'
import { HomeTemplatePicker } from './HomeTemplatePicker'

type Props = {
  isSiteStarted: boolean
}

export function HomeCreateWebsitePanel({ isSiteStarted }: Props) {
  const theme = useTheme()
  const { hasTemplates, loading } = usePublishedTemplates()

  if (isSiteStarted) {
    return (
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, md: 2.75 },
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(145deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 52%)`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          gap: 2.5
        }}
      >
        <Box className='flex items-start gap-3' sx={{ maxWidth: 560 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.secondary.main, 0.16),
              color: 'secondary.main',
              flexShrink: 0
            }}
          >
            <i className='ri-sparkling-line' style={{ fontSize: '1.4rem' }} />
          </Box>
          <div>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.75 }}>
              Refresh your website
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
              Generate a new branded version from your details, or apply another layout from the library. Your live site
              stays unchanged until you publish.
            </Typography>
          </div>
        </Box>
        <Box className='flex flex-wrap gap-2' sx={{ flexShrink: 0 }}>
          <Button
            component={Link}
            href='/your-space?aiSetup=1'
            variant='contained'
            color='secondary'
            startIcon={<i className='ri-sparkling-line' />}
          >
            Generate website
          </Button>
          {hasTemplates ? (
            <Button
              component={Link}
              href='/your-space?replaceTemplate=1'
              variant='outlined'
              startIcon={<i className='ri-layout-grid-line' />}
            >
              Browse library
            </Button>
          ) : null}
        </Box>
      </Box>
    )
  }

  return (
    <Box className='flex flex-col gap-5'>
      <Box>
        <Typography variant='h5' sx={{ fontWeight: 750, letterSpacing: '-0.02em', mb: 0.75 }}>
          Create your website
        </Typography>
        <Typography color='text.secondary' sx={{ maxWidth: 640, lineHeight: 1.6 }}>
          Two clear paths — choose a published template, or generate a unique Home, About, and Contact site from your
          brand.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
        }}
      >
        <PathCard
          icon='ri-layout-grid-line'
          title='Browse the library'
          body='Start from a finished layout. Preview the full site, apply it to your draft, then customize in Your Space.'
          href='/your-space?setup=1'
          cta='Browse templates'
          ctaIcon='ri-gallery-line'
          tone='primary'
        />
        <PathCard
          icon='ri-sparkling-line'
          title='Generate from your brand'
          body='Enter category, logo, about text, theme, and font. We build from the master layout with fresh copy and photography.'
          href='/your-space?aiSetup=1'
          cta='Generate my website'
          ctaIcon='ri-magic-line'
          tone='secondary'
          loading={loading}
          featured
        />
      </Box>

      {hasTemplates ? <HomeTemplatePicker isSiteStarted={false} /> : null}
    </Box>
  )
}

function PathCard({
  icon,
  title,
  body,
  href,
  cta,
  ctaIcon,
  tone,
  featured = false,
  loading = false
}: {
  icon: string
  title: string
  body: string
  href: string
  cta: string
  ctaIcon: string
  tone: 'primary' | 'secondary'
  featured?: boolean
  loading?: boolean
}) {
  const theme = useTheme()
  const color = theme.palette[tone].main

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 3,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        border: `1px solid ${alpha(color, featured ? 0.28 : 0.16)}`,
        background: featured
          ? `linear-gradient(155deg, ${alpha(color, 0.16)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 55%, ${theme.palette.background.paper} 100%)`
          : theme.palette.background.paper,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 16px 36px ${alpha(theme.palette.text.primary, 0.1)}`
        }
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(color, 0.14),
          color
        }}
      >
        <i className={icon} style={{ fontSize: '1.5rem' }} />
      </Box>
      <Typography variant='h6' sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.65, flex: 1 }}>
        {body}
      </Typography>
      <Button
        component={Link}
        href={href}
        variant={featured ? 'contained' : 'outlined'}
        color={tone}
        disabled={loading}
        startIcon={<i className={ctaIcon} />}
        sx={{ alignSelf: 'flex-start', mt: 1 }}
      >
        {cta}
      </Button>
    </Box>
  )
}
