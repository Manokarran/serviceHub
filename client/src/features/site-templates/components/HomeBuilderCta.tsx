'use client'

import Button from '@mui/material/Button'
import Link from 'next/link'

import { usePublishedTemplates } from '../hooks/usePublishedTemplates'

type Props = {
  liveSitePath?: string
  isSiteStarted: boolean
}

export function HomeBuilderCta({ liveSitePath, isSiteStarted }: Props) {
  const { hasTemplates, loading } = usePublishedTemplates()
  const builderHref =
    !loading && hasTemplates && !isSiteStarted ? '/your-space?setup=1' : '/your-space'

  return (
    <div className='flex flex-col sm:flex-row gap-2'>
      {liveSitePath ? (
        <Link href={liveSitePath} target='_blank' style={{ textDecoration: 'none' }}>
          <Button variant='outlined' component='span' startIcon={<i className='ri-external-link-line' />}>
            View Live Site
          </Button>
        </Link>
      ) : null}
      {!loading && hasTemplates ? (
        <Link href='/your-space?aiSetup=1' style={{ textDecoration: 'none' }}>
          <Button variant='contained' color='secondary' component='span' startIcon={<i className='ri-magic-line' />}>
            Start with AI
          </Button>
        </Link>
      ) : null}
      <Link href={builderHref} style={{ textDecoration: 'none' }}>
        <Button variant='contained' component='span' startIcon={<i className='ri-arrow-right-line' />}>
          {isSiteStarted ? 'Open builder' : hasTemplates ? 'Browse templates' : 'Open builder'}
        </Button>
      </Link>
    </div>
  )
}
