import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { getPlatformCreditSettingsAction } from '@/app/actions/credits.actions'
import { CreditSettingsClient } from '@/features/admin/components/CreditSettingsClient'
import { DEFAULT_CREDIT_COSTS, DEFAULT_SIGNUP_CREDITS } from '@/lib/constants/credits'

export const dynamic = 'force-dynamic'

export default async function SuperAdminCreditsPage() {
  const session = await auth()

  if (!session?.user || !isSuperAdminEmail(session.user.email)) {
    redirect('/home')
  }

  const settings = await getPlatformCreditSettingsAction()

  return (
    <CreditSettingsClient
      initialDefaultSignupCredits={
        settings.success ? settings.defaultSignupCredits : DEFAULT_SIGNUP_CREDITS
      }
      initialCosts={settings.success ? settings.costs : DEFAULT_CREDIT_COSTS}
    />
  )
}
