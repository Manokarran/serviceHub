'use client'

import { useTransition } from 'react'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

/**
 * Sticky bar while a super admin is viewing the app as another user.
 */
export function ImpersonationBanner() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [pending, startTransition] = useTransition()

  if (!session?.user?.impersonating) {
    return null
  }

  const name = session.user.name ?? 'user'
  const email = session.user.email ?? ''

  const handleStop = () => {
    startTransition(async () => {
      await update({ stopImpersonating: true })
      router.push('/super-admin/requests')
      router.refresh()
    })
  }

  return (
    <Alert
      severity='warning'
      sx={{ borderRadius: 0, py: 0.5 }}
      action={
        <Button color='inherit' size='small' disabled={pending} onClick={handleStop} sx={{ whiteSpace: 'nowrap' }}>
          {pending ? <CircularProgress size={16} color='inherit' /> : 'Exit impersonation'}
        </Button>
      }
    >
      Viewing as <strong>{name}</strong>
      {email ? ` (${email})` : ''}. Super-admin tools are paused until you exit.
    </Alert>
  )
}
