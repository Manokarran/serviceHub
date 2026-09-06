import { redirect } from 'next/navigation'

import { ProfilePageClient } from '@/features/profile/components/ProfilePageClient'
import { auth } from '@/lib/auth'
import { isManagerRole } from '@/lib/constants/roles'
import { getPublicSiteHref, getPublicSiteSlugAffixes } from '@/lib/utils/public-site-url'
import { tenantProfileService } from '@/services/tenant'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.registrationComplete) {
    redirect('/register')
  }

  if (!session.user.tenantId) {
    redirect('/home')
  }

  const profile = await tenantProfileService.getProfile(session.user.tenantId)
  const liveSitePath = getPublicSiteHref(profile.slug)
  const { prefix: siteUrlPrefix, suffix: siteUrlSuffix } = getPublicSiteSlugAffixes()

  return (
    <ProfilePageClient
      userName={session.user.name ?? ''}
      userEmail={session.user.email ?? ''}
      userImage={session.user.image ?? '/images/avatars/1.png'}
      userRole={session.user.role ?? ''}
      canEdit={isManagerRole(session.user.role)}
      siteUrlPrefix={siteUrlPrefix}
      siteUrlSuffix={siteUrlSuffix}
      liveSitePath={liveSitePath}
      profile={profile}
    />
  )
}
