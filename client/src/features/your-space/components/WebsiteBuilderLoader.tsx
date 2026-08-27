'use client'

import dynamic from 'next/dynamic'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import type { WebsiteBuilderProps } from '../websiteBuilder.types'

function WebsiteBuilderFallback() {
  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CircularProgress size={28} />
    </Box>
  )
}

const WebsiteBuilder = dynamic(
  () => import('./WebsiteBuilder').then(mod => ({ default: mod.WebsiteBuilder })),
  { ssr: false, loading: () => <WebsiteBuilderFallback /> }
)

export function WebsiteBuilderLoader(props: WebsiteBuilderProps) {
  return <WebsiteBuilder {...props} />
}
