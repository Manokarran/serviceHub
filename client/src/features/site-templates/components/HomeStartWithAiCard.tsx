'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { alpha, useTheme } from '@mui/material/styles'

import { usePublishedTemplates } from '../hooks/usePublishedTemplates'

export function HomeStartWithAiCard() {
  const theme = useTheme()
  const { loading, hasTemplates } = usePublishedTemplates()

  if (loading || !hasTemplates) {
    return null
  }

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
        border: `1px solid ${alpha(theme.palette.secondary.main, 0.22)}`
      }}
    >
      <CardContent className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <Box className='flex items-start gap-3'>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.secondary.main, 0.16),
              color: 'secondary.main',
              flexShrink: 0
            }}
          >
            <i className='ri-magic-line' style={{ fontSize: '1.5rem' }} />
          </Box>
          <div>
            <Typography variant='h6' className='mbe-1'>
              Start with AI
            </Typography>
            <Typography color='text.secondary'>
              Tell us about your business — we auto-select the best layout, apply your style, and use AI only for your
              website copy.
            </Typography>
          </div>
        </Box>
        <Link href='/your-space?aiSetup=1' style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Button variant='contained' color='secondary' size='large' component='span' startIcon={<i className='ri-sparkling-line' />}>
            Start with AI
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
