import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isManagerRole } from '@/lib/constants/roles'
import { getPublicSiteDisplayUrl, getPublicSitePath } from '@/lib/utils/public-site-url'
import { HomeDashboard } from '@/features/site-templates/components/HomeDashboard'
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
  const liveSitePath = tenantSlug ? getPublicSitePath(tenantSlug) : ''
  const liveSiteDisplayUrl = tenantSlug ? getPublicSiteDisplayUrl(tenantSlug) : ''
  const canManageLeads = isManagerRole(user.role)

  const [analytics, workspaceStatus] = await Promise.all([
    siteAnalyticsService.getHomeOverview(user.tenantId),
    user.tenantId ? siteWorkspaceService.getStatus(user.tenantId) : Promise.resolve(null)
  ])

  const isSiteStarted = workspaceStatus?.isSiteStarted ?? false
  const hasPublishedSite = workspaceStatus?.hasPublishedSite ?? false

  return (
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
      canManageLeads={canManageLeads}
      analytics={analytics}
    />
  )
}
