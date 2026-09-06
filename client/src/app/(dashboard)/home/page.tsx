import { redirect } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

import { auth } from '@/lib/auth'
import { isManagerRole } from '@/lib/constants/roles'
import { isTenantApproved, isTenantWorkspaceOpen } from '@/lib/constants/tenant'
import { hasUnlimitedCredits } from '@/lib/credits/has-unlimited-credits'
import { getPublicSiteDisplayUrl, getPublicSiteHref } from '@/lib/utils/public-site-url'
import { HomeDashboard } from '@/features/site-templates/components/HomeDashboard'
import { tenantRepository } from '@/repositories'
import { bookingService } from '@/services/booking/booking.service'
import { serviceCatalogService } from '@/services/booking/service-catalog.service'
import { siteAnalyticsService } from '@/services/site-analytics'
import { siteWorkspaceService } from '@/services/site-workspace'

export const dynamic = 'force-dynamic'

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
  const liveSitePath = tenantSlug ? getPublicSiteHref(tenantSlug) : ''
  const liveSiteDisplayUrl = tenantSlug ? getPublicSiteDisplayUrl(tenantSlug) : ''
  const canManageLeads = isManagerRole(user.role)

  const tenantDoc = user.tenantId ? await tenantRepository.findById(user.tenantId) : null
  const tenantApproved = tenantDoc
    ? isTenantApproved(tenantDoc.approvalStatus, tenantDoc.createdAt)
    : user.tenantApproved === true
  const workspaceOpen = tenantDoc
    ? isTenantWorkspaceOpen(tenantDoc.approvalStatus, tenantDoc.createdAt)
    : user.tenantWorkspaceOpen !== false

  let creditsBalance: number | null =
    typeof tenantDoc?.creditsBalance === 'number' ? tenantDoc.creditsBalance : null
  const unlimitedCredits = hasUnlimitedCredits(user)

  if (user.tenantId && workspaceOpen) {
    try {
      const { creditsService } = await import('@/services/credits')
      const snapshot = await creditsService.getTenantSnapshot(user.tenantId, {
        unlimited: unlimitedCredits
      })

      creditsBalance = unlimitedCredits ? null : snapshot.balance
    } catch (error) {
      console.error('[HomePage] Failed to load credits snapshot', error)
    }
  }

  const [analytics, workspaceStatus, bookingInsights, services] = await Promise.all([
    siteAnalyticsService.getHomeOverview(user.tenantId),
    user.tenantId ? siteWorkspaceService.getStatus(user.tenantId) : Promise.resolve(null),
    user.tenantId && workspaceOpen ? bookingService.getTenantInsights(user.tenantId) : Promise.resolve(null),
    user.tenantId && canManageLeads && workspaceOpen
      ? serviceCatalogService.listServices(user.tenantId)
      : Promise.resolve([])
  ])

  const isSiteStarted = workspaceStatus?.isSiteStarted ?? false
  const hasPublishedSite = workspaceStatus?.hasPublishedSite ?? false

  return (
    <Box className='flex flex-col gap-4'>
      {!workspaceOpen ? (
        <Alert severity='error'>
          Your organization access was declined. Contact support if you believe this is a mistake.
        </Alert>
      ) : !tenantApproved ? (
        <Alert severity='info'>
          {unlimitedCredits
            ? 'Super admin accounts have unlimited AI credits. Edit and preview anytime — publishing still waits on approval for this organization.'
            : `You have ${creditsBalance ?? 0} AI credits to build with. Edit, preview, and create services now — publishing goes live after a super admin approves your organization. Manual edits never use credits.`}
        </Alert>
      ) : null}
      <HomeDashboard
        firstName={user.name?.split(' ')[0] ?? 'there'}
        tenantName={user.tenantName ?? 'Your organization'}
        tenantSlug={tenantSlug}
        tenantPlan={user.tenantPlan ?? 'free'}
        userName={user.name ?? ''}
        userEmail={user.email ?? ''}
        userRole={user.role ?? ''}
        liveSitePath={liveSitePath}
        liveSiteDisplayUrl={liveSiteDisplayUrl}
        isSiteStarted={isSiteStarted}
        hasPublishedSite={hasPublishedSite}
        canManageLeads={canManageLeads && workspaceOpen}
        tenantApproved={tenantApproved}
        workspaceOpen={workspaceOpen}
        creditsBalance={creditsBalance}
        analytics={analytics}
        bookingInsights={bookingInsights}
        services={services}
      />
    </Box>
  )
}
