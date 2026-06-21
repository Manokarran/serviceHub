'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { useSession } from 'next-auth/react'
import classnames from 'classnames'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Action Imports
import { completeRegistrationAction } from '@/app/actions/auth.actions'

// Util Imports
import { sanitizeSlugInput, slugify } from '@/lib/utils/slug'

const Register = ({ mode }: { mode: Mode }) => {
  const { data: session, update } = useSession()
  const [companyName, setCompanyName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { settings } = useSettings()

  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value)

    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  const redirectToHome = async (registration?: { tenantSlug: string; tenantName: string }) => {
    // update() must receive data — calling update() with no args only GETs the session
    // and does not trigger the JWT refresh needed after registration.
    await update({
      registrationComplete: true,
      tenantSlug: registration?.tenantSlug,
      tenantName: registration?.tenantName
    })

    window.location.assign('/home')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await completeRegistrationAction({ companyName, slug: slugify(slug) })

      if (!result.success) {
        if (result.error === 'Registration is already complete.') {
          await redirectToHome()
          return
        }

        setError(result.error)
        setIsSubmitting(false)
        return
      }

      await redirectToHome({ tenantSlug: result.tenantSlug, tenantName: result.tenantName })
    } catch {
      setError('Registration failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='plb-12 pis-12'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[500px] max-is-full bs-auto'
          />
        </div>
        <Illustrations
          image1={{ src: '/images/illustrations/objects/tree-2.png' }}
          image2={null}
          maskImg={{ src: authBackground }}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[520px]'>
        <Link href='/' className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[440px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>Complete your registration</Typography>
            <Typography className='mbs-1'>
              Set up your organization on {themeConfig.templateName} to continue
            </Typography>
          </div>

          <div className='flex items-center gap-3 p-4 rounded-lg bg-actionHover'>
            <Avatar src={session?.user?.image ?? undefined} alt={session?.user?.name ?? 'User'} />
            <div>
              <Typography className='font-medium'>{session?.user?.name}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {session?.user?.email}
              </Typography>
            </div>
          </div>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            {error ? <Alert severity='error'>{error}</Alert> : null}
            <TextField
              autoFocus
              fullWidth
              label='Company name'
              value={companyName}
              onChange={event => handleCompanyNameChange(event.target.value)}
              required
            />
            <TextField
              fullWidth
              label='Workspace slug'
              value={slug}
              onChange={event => {
                setSlugTouched(true)
                setSlug(sanitizeSlugInput(event.target.value))
              }}
              onBlur={() => setSlug(slugify(slug))}
              helperText='Used in your workspace URL. Lowercase letters, numbers, and hyphens only.'
              required
            />
            <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Creating organization...' : 'Complete registration'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
