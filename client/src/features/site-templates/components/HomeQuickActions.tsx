'use client'

import Link from 'next/link'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { HOME_PALETTE } from '../constants/home-theme'

type Tone = 'primary' | 'info' | 'success' | 'warning'

type Action = {
  href: string
  label: string
  caption: string
  icon: string
  tone: Tone
}

type Props = {
  isSiteStarted: boolean
  canManageLeads: boolean
  leadCount: number
}

export function HomeQuickActions({ isSiteStarted, canManageLeads, leadCount }: Props) {
  const theme = useTheme()

  const actions: Action[] = [
    {
      href: '/your-space',
      label: 'Your Space',
      caption: isSiteStarted ? 'Edit pages and publish' : 'Build your first site',
      icon: 'ri-layout-masonry-line',
      tone: 'primary'
    },
    ...(canManageLeads
      ? ([
          {
            href: '/services',
            label: 'Services',
            caption: 'Offerings, pricing, capacity',
            icon: 'ri-calendar-check-line',
            tone: 'info'
          },
          {
            href: '/bookings',
            label: 'Bookings',
            caption: 'Schedule and requests',
            icon: 'ri-calendar-todo-line',
            tone: 'success'
          },
          {
            href: '/leads',
            label: 'Leads',
            caption: leadCount > 0 ? `${leadCount} new inquiries` : 'Contact form inbox',
            icon: 'ri-mail-line',
            tone: 'warning'
          }
        ] satisfies Action[])
      : ([
          {
            href: '/profile',
            label: 'Profile',
            caption: 'Account and preferences',
            icon: 'ri-user-settings-line',
            tone: 'info'
          },
          {
            href: '/about',
            label: 'About',
            caption: 'What ServiceHub can do',
            icon: 'ri-information-line',
            tone: 'success'
          }
        ] satisfies Action[]))
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 1.25, md: 2 },
        // Native-style stacked rows on phones; card grid from tablet up.
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: `repeat(${actions.length}, 1fr)` }
      }}
    >
      {actions.map(action => {
        const color = action.tone === 'primary' ? HOME_PALETTE.accent : theme.palette[action.tone].main

        return (
          <Box
            key={action.href}
            component={Link}
            href={action.href}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: { xs: 'row', sm: 'column' },
              alignItems: { xs: 'center', sm: 'stretch' },
              gap: { xs: 1.5, sm: 1.25 },
              p: { xs: 1.5, sm: 2.25 },
              minHeight: { xs: 64, sm: 'auto' },
              borderRadius: { xs: 2.5, sm: 3 },
              textDecoration: 'none',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
              WebkitTapHighlightColor: 'transparent',
              '&:active': {
                transform: { xs: 'scale(0.985)', sm: 'none' },
                bgcolor: { xs: alpha(color, 0.04), sm: 'background.paper' }
              },
              '&:hover': {
                transform: { sm: 'translateY(-3px)' },
                borderColor: alpha(color, 0.45),
                boxShadow: { sm: `0 14px 30px ${alpha(color, 0.18)}` }
              },
              '&:hover .quick-action-arrow': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'flex-start', sm: 'space-between' },
                gap: 1.5,
                width: { xs: 'auto', sm: '100%' }
              }}
            >
              <Box
                sx={{
                  width: { xs: 42, sm: 40 },
                  height: { xs: 42, sm: 40 },
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(color, 0.14),
                  color,
                  flexShrink: 0
                }}
              >
                <i className={action.icon} style={{ fontSize: '1.25rem' }} />
              </Box>
              <Box
                className='quick-action-arrow'
                sx={{
                  color,
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  opacity: 0,
                  transform: 'translateX(-6px)',
                  transition: 'opacity 0.2s, transform 0.2s',
                  flexShrink: 0
                }}
              >
                <i className='ri-arrow-right-line' />
              </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.25 }}>
                {action.label}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {action.caption}
              </Typography>
            </Box>

            <Box
              sx={{
                color,
                display: { xs: 'flex', sm: 'none' },
                alignItems: 'center',
                opacity: 0.55,
                flexShrink: 0
              }}
            >
              <i className='ri-arrow-right-s-line' style={{ fontSize: '1.35rem' }} />
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
