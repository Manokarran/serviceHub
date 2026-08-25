'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ensureBaseWebsitePagesAction } from '@/app/actions/ai-site-wizard.actions'
import type { SiteTemplateSummary } from '@/models/site-template'

import { AiSiteWizardDialog } from './ai-wizard/AiSiteWizardDialog'

type Props = {
  templates: SiteTemplateSummary[]
}

export function SuperAdminStudioView({ templates }: Props) {
  const router = useRouter()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openBuilder = async () => {
    setBusy(true)
    setError(null)

    const result = await ensureBaseWebsitePagesAction()

    setBusy(false)

    if (!result.success) {
      setError(result.error)

      return
    }

    router.push('/super-admin/studio/builder')
  }

  return (
    <Box className='flex flex-col gap-6'>
      <div>
        <Typography variant='h4' className='mbe-1'>
          Website design studio
        </Typography>
        <Typography color='text.secondary' className='max-is-[760px]'>
          Design the master website first (Home, About, Contact). Then generate branded variations — copy, colors,
          fonts, photography, and motion — review them, and save the keepers to the template library.
        </Typography>
      </div>

      {error ? <Alert severity='error'>{error}</Alert> : null}
      {message ? <Alert severity='success'>{message}</Alert> : null}

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        <Card sx={{ height: '100%' }}>
          <CardContent className='flex flex-col gap-3 h-full'>
            <Typography variant='overline' color='primary'>
              Step 1
            </Typography>
            <Typography variant='h6'>Design the base</Typography>
            <Typography color='text.secondary'>
              Open the base template builder and design Home, About, and Contact. Every section and control becomes the
              skeleton for generated sites.
            </Typography>
            <Box className='mt-auto'>
              <Button
                variant='contained'
                disabled={busy}
                onClick={() => void openBuilder()}
                startIcon={<i className='ri-layout-masonry-line' />}
              >
                {busy ? 'Preparing pages…' : 'Open base template builder'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%' }}>
          <CardContent className='flex flex-col gap-3 h-full'>
            <Typography variant='overline' color='secondary'>
              Step 2
            </Typography>
            <Typography variant='h6'>Generate a branded site</Typography>
            <Typography color='text.secondary'>
              Provide category, logo, title, about text, theme, and font. The engine walks each page, writes copy,
              picks photos, and applies a fresh color and motion mix.
            </Typography>
            <Box className='mt-auto'>
              <Button
                variant='contained'
                color='secondary'
                startIcon={<i className='ri-sparkling-line' />}
                onClick={() => setWizardOpen(true)}
              >
                Generate website
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%' }}>
          <CardContent className='flex flex-col gap-3 h-full'>
            <Typography variant='overline'>Step 3</Typography>
            <Typography variant='h6'>Verify and publish</Typography>
            <Typography color='text.secondary'>
              Preview the generated site, regenerate if you want a different mix, then save it to the library. Users
              can pick it or generate their own from the same engine.
            </Typography>
            <Box className='mt-auto'>
              <Link href='/super-admin/templates' style={{ textDecoration: 'none' }}>
                <Button variant='outlined' component='span' startIcon={<i className='ri-gallery-line' />}>
                  Open template library
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Alert severity='info' icon={<i className='ri-lightbulb-line' />}>
        Each generate run is different. The same inputs still produce new photography, motion, color emphasis, and
        copy. The master base template is updated only when you edit it in the base template builder — generated
        previews never overwrite it until you save one to the library.
      </Alert>

      <AiSiteWizardDialog
        open={wizardOpen}
        templates={templates}
        mode='library'
        onClose={() => setWizardOpen(false)}
        onCreated={templateId => {
          setWizardOpen(false)
          setMessage('Saved to the template library. Publish it when you are ready for users.')
          if (templateId) {
            router.push(`/super-admin/templates/${templateId}`)
          }
        }}
      />
    </Box>
  )
}
