import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { listAllSiteTemplatesAction } from '@/app/actions/site-template.actions'

export default async function SuperAdminPage() {
  const session = await auth()

  if (!session?.user || !isSuperAdminEmail(session.user.email)) {
    redirect('/home')
  }

  const templatesResult = await listAllSiteTemplatesAction()
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
          Manage platform-wide website templates and starter experiences for new organizations.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent className='flex flex-col gap-4 h-full'>
            <Box className='flex items-center gap-2'>
              <i className='ri-layout-grid-line text-primary text-2xl' />
              <Typography variant='h6'>Website templates</Typography>
            </Box>
            <Typography color='text.secondary'>
              Create ready-made websites with thumbnails. Users pick a template when registering or from their
              dashboard to jump-start their site.
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
                <Button variant='contained' startIcon={<i className='ri-arrow-right-line' />}>
                  Manage templates
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%', bgcolor: 'action.hover' }}>
          <CardContent className='flex flex-col gap-3'>
            <Typography variant='h6'>How it works</Typography>
            <Typography variant='body2' color='text.secondary'>
              1. Create a template with name and thumbnail
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              2. Build the site in Your Space using the drag-and-drop builder
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              3. Capture your workspace into the template snapshot
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              4. Publish — it appears in the gallery for all users
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
