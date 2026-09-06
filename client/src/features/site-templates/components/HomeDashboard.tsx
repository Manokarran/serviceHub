'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

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

import { HOME_HERO_GRADIENT, HOME_PALETTE, HOME_SECTION_ACCENT } from '../constants/home-theme'
import { HomeBookingInsights } from './HomeBookingInsights'
import { HomeAnalyticsSection } from './HomeAnalyticsSection'
import { HomeCreateWebsitePanel } from './HomeCreateWebsitePanel'
import { HomeQuickActions } from './HomeQuickActions'

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
  tenantApproved: boolean
  workspaceOpen: boolean
  creditsBalance: number | null
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
  tenantApproved,
  workspaceOpen,
  creditsBalance,
  analytics,
  bookingInsights,
  services
}: Props) {
  const theme = useTheme()
  const accent = HOME_PALETTE.accent
  const accentDeep = HOME_PALETTE.deep
  const ink = theme.palette.text.primary
  const [copied, setCopied] = useState(false)

  const leadCount = analytics?.current?.leads ?? 0

  const copyLiveUrl = async () => {
    if (!liveSitePath) {
      return
    }

    try {
      const absolute =
        liveSitePath.startsWith('http://') || liveSitePath.startsWith('https://')
          ? liveSitePath
          : `${window.location.origin}${liveSitePath}`

      await navigator.clipboard.writeText(absolute)
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
          background: `radial-gradient(ellipse at 20% 0%, ${alpha(HOME_PALETTE.soft, 0.35)} 0%, transparent 55%), radial-gradient(ellipse at 80% 10%, ${alpha(HOME_PALETTE.cyan, 0.22)} 0%, transparent 50%), radial-gradient(ellipse at 60% 0%, ${alpha(HOME_PALETTE.pink, 0.12)} 0%, transparent 45%)`,
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
          background: HOME_HERO_GRADIENT,
          boxShadow: `0 22px 48px ${alpha(accentDeep, 0.38)}, inset 0 1px 0 ${alpha('#fff', 0.28)}`,
          border: `1px solid ${alpha('#fff', 0.22)}`
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.14,
            backgroundImage: `linear-gradient(${alpha('#fff', 0.6)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#fff', 0.6)} 1px, transparent 1px)`,
            backgroundSize: '46px 46px',
            maskImage: 'radial-gradient(circle at 12% 0%, #000 0%, transparent 62%)',
            WebkitMaskImage: 'radial-gradient(circle at 12% 0%, #000 0%, transparent 62%)'
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
            background: `radial-gradient(circle, ${alpha(HOME_PALETTE.cyan, 0.55)} 0%, ${alpha(HOME_PALETTE.soft, 0.16)} 46%, transparent 70%)`,
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
            background: `radial-gradient(circle, ${alpha(HOME_PALETTE.pink, 0.4)} 0%, transparent 68%)`,
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
              <Chip
                label={`${tenantPlan} plan`}
                size='small'
                sx={{
                  bgcolor: alpha('#fff', 0.12),
                  color: 'common.white',
                  border: `1px solid ${alpha('#fff', 0.24)}`,
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                  textTransform: 'capitalize'
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
                backgroundImage: `linear-gradient(100deg, #FFFFFF 0%, #FFFFFF 46%, ${alpha('#FFFFFF', 0.78)} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 8px 20px rgba(255,255,255,0.22))'
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
                textShadow: `0 1px 12px ${alpha(accentDeep, 0.4)}`
              }}
            >
              {isSiteStarted
                ? 'Your command center for the live site — traffic, clicks, and the next edits in one place.'
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
            {workspaceOpen ? (
              <Button
                component={Link}
                href='/your-space'
                variant='contained'
                size='large'
                startIcon={<i className='ri-layout-masonry-line' />}
                sx={{
                  bgcolor: 'common.white',
                  color: accentDeep,
                  fontWeight: 700,
                  px: 2.5,
                  boxShadow: `0 12px 28px ${alpha(accentDeep, 0.3)}`,
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.88)
                  }
                }}
              >
                {isSiteStarted ? 'Open Your Space' : 'Open builder'}
              </Button>
            ) : (
              <Button
                variant='contained'
                size='large'
                disabled
                startIcon={<i className='ri-lock-line' />}
                sx={{
                  bgcolor: alpha('#fff', 0.35),
                  color: accentDeep,
                  fontWeight: 700,
                  px: 2.5
                }}
              >
                Workspace locked
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {workspaceOpen && !tenantApproved ? (
        <Section
          title='Ready to build'
          caption='Use your welcome credits while we review your organization'
        >
          <Box
            sx={{
              borderRadius: 3,
              p: 3,
              border: `1px dashed ${alpha(HOME_PALETTE.cyan, 0.35)}`,
              bgcolor: alpha(HOME_PALETTE.sky, 0.85)
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.75 }}>
              {creditsBalance != null ? `${creditsBalance} credits available` : 'Welcome credits ready'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
              Edit and preview freely. AI features and each new service use credits. Publishing to your live site unlocks
              as soon as a super admin approves you.
            </Typography>
            <Button
              component={Link}
              href='/your-space'
              variant='outlined'
              startIcon={<i className='ri-eye-line' />}
              sx={{
                borderColor: alpha(HOME_PALETTE.accent, 0.55),
                color: HOME_PALETTE.dark,
                '&:hover': {
                  borderColor: HOME_PALETTE.accent,
                  bgcolor: alpha(HOME_PALETTE.accent, 0.06)
                }
              }}
            >
              Preview in builder
            </Button>
          </Box>
        </Section>
      ) : null}

      {workspaceOpen ? (
        <Section
          title={isSiteStarted ? 'Your website' : 'Get started'}
          caption={
            isSiteStarted
              ? 'Chat with the builder, generate a new version, or swap the layout'
              : 'Start from a conversation, a brand form, or a library layout'
          }
        >
          <HomeCreateWebsitePanel isSiteStarted={isSiteStarted} />
        </Section>
      ) : (
        <Section
          title='Access declined'
          caption='This organization cannot use the workspace'
        >
          <Box
            sx={{
              borderRadius: 3,
              p: 3,
              border: `1px dashed ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.error.main, 0.06)
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.75 }}>
              Contact support
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Your registration was not approved. Reach out if you need this decision reviewed.
            </Typography>
          </Box>
        </Section>
      )}

      {workspaceOpen ? (
        <Section title='Jump back in' caption='The places you use most'>
          <HomeQuickActions isSiteStarted={isSiteStarted} canManageLeads={canManageLeads} leadCount={leadCount} />
        </Section>
      ) : null}

      {workspaceOpen && isSiteStarted && analytics ? (
        <Section title='Site performance' caption={`How your website performed over the last ${analytics.kpiDays} days`}>
          <HomeAnalyticsSection analytics={analytics} hasPublishedSite={hasPublishedSite} />
        </Section>
      ) : null}

      {workspaceOpen && isSiteStarted && canManageLeads ? (
        <HomeBookingInsights insights={bookingInsights} services={services} />
      ) : null}

      <Section title='Workspace' caption='Who you are signed in as, and where your site lives'>
        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: {
              xs: '1fr',
              md: workspaceOpen && canManageLeads ? '1.15fr 1fr' : '1fr'
            }
          }}
        >
          {workspaceOpen && canManageLeads ? (
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
                    color: accent,
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
                    {leadCount > 0
                      ? `${leadCount} new inquiries in the last ${analytics.kpiDays} days. Review, update status, and export CSV.`
                      : 'Review messages from your site contact form, update status, and export CSV.'}
                  </Typography>
                </div>
              </Box>
              <Button
                component={Link}
                href='/leads'
                variant='contained'
                endIcon={<i className='ri-arrow-right-line' />}
                sx={{
                  flexShrink: 0,
                  bgcolor: HOME_PALETTE.dark,
                  '&:hover': { bgcolor: HOME_PALETTE.deep }
                }}
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
                Account
              </Typography>
              <Chip
                label={tenantPlan}
                size='small'
                variant='tonal'
                sx={{
                  bgcolor: alpha(HOME_PALETTE.accent, 0.14),
                  color: HOME_PALETTE.dark,
                  fontWeight: 600
                }}
              />
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
      </Section>
    </Box>
  )
}

function Section({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
  return (
    <Box component='section' className='flex flex-col gap-3.5'>
      <Box className='flex items-center gap-2.5'>
        <Box
          aria-hidden
          sx={{
            width: 4,
            height: 30,
            borderRadius: 99,
            flexShrink: 0,
            background: HOME_SECTION_ACCENT
          }}
        />
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 750, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            {title}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {caption}
          </Typography>
        </Box>
      </Box>
      {children}
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
