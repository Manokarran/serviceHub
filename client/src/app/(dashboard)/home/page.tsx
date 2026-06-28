import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isManagerRole } from '@/lib/constants/roles'
import { getPublicSiteDisplayUrl, getPublicSitePath } from '@/lib/utils/public-site-url'
import { HomeBuilderCta } from '@/features/site-templates/components/HomeBuilderCta'
import { HomeSiteManageCard } from '@/features/site-templates/components/HomeSiteManageCard'
import { HomeTemplatePicker } from '@/features/site-templates/components/HomeTemplatePicker'
import { siteWorkspaceService } from '@/services/site-workspace'

export default async function HomePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.registrationComplete) {
    redirect('/register')
  }

  const { user } = session
  const tenantSlug = user.tenantSlug ?? ''
  const liveSitePath = tenantSlug ? getPublicSitePath(tenantSlug) : ''
  const liveSiteDisplayUrl = tenantSlug ? getPublicSiteDisplayUrl(tenantSlug) : ''
  const canManageLeads = isManagerRole(user.role)

  let isSiteStarted = false
  let hasPublishedSite = false

  if (user.tenantId) {
    const workspaceStatus = await siteWorkspaceService.getStatus(user.tenantId)

    isSiteStarted = workspaceStatus.isSiteStarted
    hasPublishedSite = workspaceStatus.hasPublishedSite
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Typography variant='h4' className='mbe-1'>
          Welcome back, {user.name?.split(' ')[0] ?? 'there'}!
        </Typography>
        <Typography color='text.secondary'>
          You are signed in to {user.tenantName}. Build and manage your company website from here.
        </Typography>
      </Grid>
      <Grid size={12}>
        <Card sx={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)' }}>
          <CardContent className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <i className='ri-layout-masonry-line text-primary text-xl' />
                <Typography variant='h6'>Your Space</Typography>
              </div>
              <Typography color='text.secondary'>
                {isSiteStarted
                  ? 'Continue editing your company website — drafts are private until you publish.'
                  : 'Build your company website with drag-and-drop — pick a template or start from scratch, then customize every section.'}
              </Typography>
              {liveSitePath ? (
                <Link
                  href={liveSitePath}
                  target='_blank'
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  className='flex items-center gap-2'
                >
                  <i className='ri-global-line text-success' />
                  <Typography variant='body2' color='primary.main' sx={{ fontWeight: 600 }}>
                    {liveSiteDisplayUrl}
                  </Typography>
                  <i className='ri-external-link-line text-sm opacity-60' />
                </Link>
              ) : null}
            </div>
            <HomeBuilderCta liveSitePath={liveSitePath} isSiteStarted={isSiteStarted} />
          </CardContent>
        </Card>
      </Grid>
      <Grid size={12}>
        <HomeTemplatePicker isSiteStarted={isSiteStarted} />
      </Grid>
      {isSiteStarted ? (
        <Grid size={12}>
          <HomeSiteManageCard hasPublishedSite={hasPublishedSite} />
        </Grid>
      ) : null}
      {canManageLeads ? (
        <Grid size={12}>
          <Card>
            <CardContent className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <i className='ri-mail-line text-primary text-xl' />
                  <Typography variant='h6'>Contact leads</Typography>
                </div>
                <Typography color='text.secondary'>
                  View and manage messages from your public site contact form — update status, export CSV, and
                  configure notifications.
                </Typography>
              </div>
              <Link href='/leads' style={{ textDecoration: 'none' }}>
                <Button variant='contained' component='span' startIcon={<i className='ri-arrow-right-line' />}>
                  Open Leads
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
      ) : null}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <Typography variant='h6'>Your account</Typography>
            <Typography>
              <strong>Name:</strong> {user.name}
            </Typography>
            <Typography>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography>
              <strong>Role:</strong> {user.role}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <Typography variant='h6'>Organization</Typography>
            <Typography>
              <strong>Company:</strong> {user.tenantName}
            </Typography>
            <Typography>
              <strong>Workspace slug:</strong> {user.tenantSlug}
            </Typography>
            <div className='flex gap-2'>
              <Chip label={user.tenantPlan} color='primary' size='small' variant='tonal' />
              <Chip label='Active' color='success' size='small' variant='tonal' />
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
