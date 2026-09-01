import Link from 'next/link'

import { redirect } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { listAllSiteTemplatesAction } from '@/app/actions/site-template.actions'
import { getAdminResourceOverview } from '@/services/admin/admin-resource.service'
import { SuperAdminResourceOverview } from '@/features/site-templates/components/SuperAdminResourceOverview'

export default async function SuperAdminPage() {
  const session = await auth()

  if (!session?.user || !isSuperAdminEmail(session.user.email)) {
    redirect('/home')
  }

  const [templatesResult, resourceOverview] = await Promise.all([listAllSiteTemplatesAction(), getAdminResourceOverview()])
  const templateCount = templatesResult.success ? templatesResult.templates.length : 0

  const publishedCount = templatesResult.success
    ? templatesResult.templates.filter(template => template.status === 'published').length
    : 0

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Typography variant='h4' className='mbe-1'>
          Super Admin
        </Typography>
        <Typography color='text.secondary'>
          Design the base website, generate branded variations, and publish keepers to the template library. Users can
          pick a library site or generate one from their own details.
        </Typography>
      </Grid>

      <Grid size={12}>
        <SuperAdminResourceOverview overview={resourceOverview} />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent className='flex flex-col gap-4 h-full'>
            <Box className='flex items-center gap-2'>
              <i className='ri-palette-line text-secondary text-2xl' />
              <Typography variant='h6'>Design studio</Typography>
            </Box>
            <Typography color='text.secondary'>
              Step 1: design Home, About, and Contact in Your Space. Step 2: generate branded websites from that base.
              Step 3: preview, then save the ones you like to the library.
            </Typography>
            <Box className='mt-auto'>
              <Link href='/super-admin/studio' style={{ textDecoration: 'none' }}>
                <Button variant='contained' color='secondary' startIcon={<i className='ri-sparkling-line' />}>
                  Open studio
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent className='flex flex-col gap-4 h-full'>
            <Box className='flex items-center gap-2'>
              <i className='ri-layout-grid-line text-primary text-2xl' />
              <Typography variant='h6'>Template library</Typography>
            </Box>
            <Typography color='text.secondary'>
              Saved websites appear here. Publish a draft so organizations can choose it, or they can generate a unique
              site from the same engine.
            </Typography>
            <Box className='flex gap-4'>
              <Typography variant='body2'>
                <strong>{templateCount}</strong> total
              </Typography>
              <Typography variant='body2' color='success.main'>
                <strong>{publishedCount}</strong> published
              </Typography>
            </Box>
            <Box className='mt-auto'>
              <Link href='/super-admin/templates' style={{ textDecoration: 'none' }}>
                <Button variant='outlined' startIcon={<i className='ri-arrow-right-line' />}>
                  Open library
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
