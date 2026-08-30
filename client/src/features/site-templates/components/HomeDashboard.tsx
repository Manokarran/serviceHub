'use client'

import { useState } from 'react'

import Link from 'next/link'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, keyframes, useTheme } from '@mui/material/styles'

import type { BookingInsights } from '@/models/booking'
import type { SiteAnalyticsOverview } from '@/models/site-analytics'
import type { ServiceListItem } from '@/services/booking/service-catalog.service'

import { HomeBookingInsights } from './HomeBookingInsights'
import { HomeAnalyticsSection } from './HomeAnalyticsSection'
import { HomeCreateWebsitePanel } from './HomeCreateWebsitePanel'

type Props = {
  firstName: string
  tenantName: string
  tenantSlug: string
  tenantPlan: string
  userName: string
  userEmail: string
  userRole: string
  liveSitePath: string
  liveSiteDisplayUrl: string
  isSiteStarted: boolean
  hasPublishedSite: boolean
  canManageLeads: boolean
  analytics: SiteAnalyticsOverview
  bookingInsights: BookingInsights | null
  services: ServiceListItem[]
}

const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const drift = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(12px, -10px, 0) scale(1.08); }
`

const livePulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(86, 202, 0, 0.55); }
  70% { box-shadow: 0 0 0 8px rgba(86, 202, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(86, 202, 0, 0); }
`

export function HomeDashboard({
  firstName,
  tenantName,
  tenantSlug,
  tenantPlan,
  userName,
  userEmail,
  userRole,
  liveSitePath,
  liveSiteDisplayUrl,
  isSiteStarted,
  hasPublishedSite,
  canManageLeads,
  analytics,
  bookingInsights,
  services
}: Props) {
  const theme = useTheme()
  const accent = theme.palette.primary.main
  const ink = theme.palette.text.primary
  const heroInk = '#3B0764'
  const [copied, setCopied] = useState(false)

  const copyLiveUrl = async () => {
    if (!liveSitePath) {
      return
    }

    try {
      await navigator.clipboard.writeText(`${window.location.origin}${liveSitePath}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Box
      className='flex flex-col gap-6'
      sx={{
        position: 'relative',
        animation: `${floatIn} 0.55s ease-out both`
      }}
    >
      <Box
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: { xs: '-28px -6% auto', md: '-36px -4% auto' },
          height: 260,
          background: `radial-gradient(ellipse at 20% 0%, ${alpha('#C084FC', 0.28)} 0%, transparent 55%), radial-gradient(ellipse at 80% 10%, ${alpha('#818CF8', 0.22)} 0%, transparent 50%)`,
          filter: 'blur(18px)'
        }}
      />

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          isolation: 'isolate',
          borderRadius: 4,
          px: { xs: 2.75, md: 4.25 },
          py: { xs: 3.1, md: 3.75 },
          color: 'common.white',
          background: `
            radial-gradient(1200px 320px at -8% -30%, ${alpha('#F5D0FE', 0.42)} 0%, transparent 58%),
            radial-gradient(900px 280px at 108% -10%, ${alpha('#7DD3FC', 0.3)} 0%, transparent 52%),
            radial-gradient(720px 240px at 72% 130%, ${alpha('#A78BFA', 0.45)} 0%, transparent 58%),
            linear-gradient(118deg, #5B21B6 0%, #6D28D9 28%, ${accent} 62%, #818CF8 100%)
          `,
          boxShadow: `0 22px 48px ${alpha('#6D28D9', 0.32)}, inset 0 1px 0 ${alpha('#fff', 0.28)}`,
          border: `1px solid ${alpha('#fff', 0.22)}`
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${alpha('#fff', 0.16)} 0%, transparent 42%)`,
            pointerEvents: 'none'
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            right: { xs: -120, md: -48 },
            top: { xs: -150, md: -110 },
            background: `radial-gradient(circle, ${alpha('#F0ABFC', 0.55)} 0%, ${alpha('#C084FC', 0.12)} 46%, transparent 70%)`,
            animation: `${drift} 11s ease-in-out infinite`,
            pointerEvents: 'none'
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            left: { xs: -80, md: 180 },
            bottom: { xs: -120, md: -90 },
            background: `radial-gradient(circle, ${alpha('#67E8F9', 0.32)} 0%, transparent 68%)`,
            animation: `${drift} 14s ease-in-out infinite reverse`,
            pointerEvents: 'none'
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 3
          }}
        >
          <Box sx={{ maxWidth: 640 }}>
            <Box className='flex items-center gap-1.5 flex-wrap' sx={{ mb: 1.5 }}>
              <Chip
                label={tenantName}
                size='small'
                sx={{
                  bgcolor: alpha('#fff', 0.16),
                  color: 'common.white',
                  border: `1px solid ${alpha('#fff', 0.32)}`,
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600
                }}
              />
              <Chip
                label={
                  <Box className='flex items-center gap-1.5'>
                    {hasPublishedSite ? (
                      <Box
                        component='span'
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#BBF7D0',
                          animation: `${livePulse} 1.8s ease-out infinite`
                        }}
                      />
                    ) : null}
                    {hasPublishedSite ? 'Live' : isSiteStarted ? 'Draft' : 'Not started'}
                  </Box>
                }
                size='small'
                sx={{
                  bgcolor: hasPublishedSite ? alpha('#86EFAC', 0.22) : alpha('#fff', 0.12),
                  color: 'common.white',
                  border: `1px solid ${alpha('#fff', 0.28)}`,
                  backdropFilter: 'blur(10px)',
                  fontWeight: 700
                }}
              />
            </Box>
            <Typography
              variant='h3'
              sx={{
                display: 'inline-block',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.12,
                mb: 1,
                fontSize: { xs: '1.7rem', md: '2.25rem' },
                color: '#fff',
                backgroundImage: 'linear-gradient(105deg, #FFFFFF 0%, #FFF7FF 32%, #F5D0FE 68%, #E0E7FF 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 8px 20px rgba(255,255,255,0.28))'
              }}
            >
              Welcome back, {firstName}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.92)',
                WebkitTextFillColor: 'rgba(255,255,255,0.92)',
                maxWidth: 540,
                mb: 2,
                lineHeight: 1.55,
                textShadow: '0 1px 12px rgba(46, 16, 101, 0.28)'
              }}
            >
              {isSiteStarted
                ? 'A tighter command center for your live site — traffic, clicks, and next edits in one place.'
                : 'Create a polished company website in minutes — pick a published layout or generate one from your brand details.'}
            </Typography>

            {liveSitePath ? (
              <Box className='inline-flex items-center gap-1'>
                <Link href={liveSitePath} target='_blank' style={{ textDecoration: 'none' }}>
                  <Box
                    component='span'
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.5,
                      py: 0.7,
                      borderRadius: 999,
                      bgcolor: alpha('#fff', 0.14),
                      border: `1px solid ${alpha('#fff', 0.3)}`,
                      backdropFilter: 'blur(10px)',
                      color: 'common.white',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      transition: 'background-color 0.2s, transform 0.2s',
                      '&:hover': { bgcolor: alpha('#fff', 0.24), transform: 'translateY(-1px)' }
                    }}
                  >
                    <i className='ri-global-line' />
                    {liveSiteDisplayUrl}
                    <i className='ri-external-link-line' style={{ opacity: 0.7, fontSize: '0.85rem' }} />
                  </Box>
                </Link>
                <Tooltip title={copied ? 'Copied' : 'Copy link'}>
                  <IconButton
                    size='small'
                    onClick={copyLiveUrl}
                    sx={{
                      color: 'common.white',
                      bgcolor: alpha('#fff', 0.14),
                      border: `1px solid ${alpha('#fff', 0.28)}`,
                      backdropFilter: 'blur(10px)',
                      '&:hover': { bgcolor: alpha('#fff', 0.26) }
                    }}
                    aria-label='Copy live site link'
                  >
                    <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} style={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : null}
          </Box>

          <Box className='flex flex-wrap gap-2' sx={{ flexShrink: 0 }}>
            {liveSitePath && isSiteStarted ? (
              <Button
                component={Link}
                href={liveSitePath}
                target='_blank'
                variant='outlined'
                startIcon={<i className='ri-external-link-line' />}
                sx={{
                  borderColor: alpha('#fff', 0.55),
                  color: 'common.white',
                  bgcolor: alpha('#fff', 0.08),
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: alpha('#fff', 0.16)
                  }
                }}
              >
                View live site
              </Button>
            ) : null}
            <Button
              component={Link}
              href='/your-space'
              variant='contained'
              size='large'
              startIcon={<i className='ri-layout-masonry-line' />}
              sx={{
                bgcolor: 'common.white',
                color: heroInk,
                fontWeight: 700,
                px: 2.5,
                boxShadow: `0 12px 28px ${alpha('#2E1065', 0.28)}`,
                '&:hover': {
                  bgcolor: '#F5F3FF'
                }
              }}
            >
              {isSiteStarted ? 'Open Your Space' : 'Open builder'}
            </Button>
          </Box>
        </Box>
      </Box>

      {isSiteStarted && analytics ? (
        <HomeAnalyticsSection analytics={analytics} hasPublishedSite={hasPublishedSite} />
      ) : null}

      {isSiteStarted && canManageLeads ? (
        <HomeBookingInsights insights={bookingInsights} services={services} />
      ) : null}

      <HomeCreateWebsitePanel isSiteStarted={isSiteStarted} />

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: {
            xs: '1fr',
            md: canManageLeads ? '1.15fr 1fr' : '1fr'
          }
        }}
      >
        {canManageLeads ? (
          <Box
            sx={{
              borderRadius: 3,
              p: 2.75,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(160deg, ${alpha(accent, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 58%)`,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              gap: 2.5,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 28px ${alpha(ink, 0.08)}`
              }
            }}
          >
            <Box className='flex items-start gap-3'>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(accent, 0.14),
                  color: 'primary.main',
                  flexShrink: 0
                }}
              >
                <i className='ri-mail-open-line' style={{ fontSize: '1.3rem' }} />
              </Box>
              <div>
                <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.4 }}>
                  Contact leads
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {analytics?.current?.leads > 0
                    ? `${analytics.current.leads} new inquiries in the last ${analytics.kpiDays} days. Review, update status, and export CSV.`
                    : 'Review messages from your site contact form, update status, and export CSV.'}
                </Typography>
              </div>
            </Box>
            <Button
              component={Link}
              href='/leads'
              variant='contained'
              endIcon={<i className='ri-arrow-right-line' />}
              sx={{ flexShrink: 0 }}
            >
              Open leads
            </Button>
          </Box>
        ) : null}

        <Box
          sx={{
            borderRadius: 3,
            p: 2.75,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.92),
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Box className='flex items-center justify-between gap-2 flex-wrap'>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              Workspace
            </Typography>
            <Chip label={tenantPlan} size='small' color='primary' variant='tonal' />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 1.25,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }
            }}
          >
            <MetaItem label='Signed in as' value={userName} />
            <MetaItem label='Email' value={userEmail} />
            <MetaItem label='Role' value={userRole} />
            <MetaItem label='Workspace' value={tenantSlug || '—'} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant='body2' sx={{ fontWeight: 600 }} noWrap title={value}>
        {value}
      </Typography>
    </Box>
  )
}
