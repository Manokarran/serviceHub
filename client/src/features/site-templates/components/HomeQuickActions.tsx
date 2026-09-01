'use client'

import Link from 'next/link'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

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
        gap: 2,
        gridTemplateColumns: { xs: '1fr 1fr', md: `repeat(${actions.length}, 1fr)` }
      }}
    >
      {actions.map(action => {
        const color = theme.palette[action.tone].main

        return (
          <Box
            key={action.href}
            component={Link}
            href={action.href}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              p: 2.25,
              borderRadius: 3,
              textDecoration: 'none',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
              '&:hover': {
                transform: 'translateY(-3px)',
                borderColor: alpha(color, 0.45),
                boxShadow: `0 14px 30px ${alpha(color, 0.18)}`
              },
              '&:hover .quick-action-arrow': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            }}
          >
            <Box className='flex items-center justify-between gap-2'>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(color, 0.14),
                  color
                }}
              >
                <i className={action.icon} style={{ fontSize: '1.25rem' }} />
              </Box>
              <Box
                className='quick-action-arrow'
                sx={{
                  color,
                  opacity: 0,
                  transform: 'translateX(-6px)',
                  transition: 'opacity 0.2s, transform 0.2s'
                }}
              >
                <i className='ri-arrow-right-line' />
              </Box>
            </Box>
            <div>
              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{action.label}</Typography>
              <Typography variant='caption' color='text.secondary'>
                {action.caption}
              </Typography>
            </div>
          </Box>
        )
      })}
    </Box>
  )
}
