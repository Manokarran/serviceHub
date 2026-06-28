'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

type Props = {
  hasPublishedSite: boolean
}

export function HomeSiteManageCard({ hasPublishedSite }: Props) {
  return (
    <Card variant='outlined'>
      <CardContent className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <Typography variant='subtitle1' className='font-semibold'>
            Need a clean slate?
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {hasPublishedSite
              ? 'Reset your draft or swap in a new template. Your live site stays published until you publish again.'
              : 'Reset your draft workspace or apply a different template layout.'}
          </Typography>
        </div>
        <Box className='flex flex-wrap gap-2'>
          <Link href='/your-space?replaceTemplate=1' style={{ textDecoration: 'none' }}>
            <Button variant='outlined' size='small' component='span' startIcon={<i className='ri-exchange-line' />}>
              Replace with template
            </Button>
          </Link>
          <Link href='/your-space?startFresh=1' style={{ textDecoration: 'none' }}>
            <Button variant='text' size='small' component='span' startIcon={<i className='ri-refresh-line' />}>
              Start fresh
            </Button>
          </Link>
        </Box>
      </CardContent>
    </Card>
  )
}
