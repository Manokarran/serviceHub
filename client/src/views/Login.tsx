'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { signIn } from 'next-auth/react'
import classnames from 'classnames'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

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

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    'Google sign-in is misconfigured. Verify GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_URL, and NEXTAUTH_SECRET on Vercel.',
  AccessDenied:
    'Sign-in was denied. If your Google OAuth app is still in Testing mode, add your email as a test user or publish the app in Google Cloud Console. Otherwise verify GOOGLE_CLIENT_ID/SECRET and the production redirect URI on Vercel.',
  DatabaseError:
    'Could not save your account. Check that MONGODB_URI is set on Vercel and MongoDB Atlas allows connections from anywhere (0.0.0.0/0).',
  UserInactive: 'Your account is inactive. Contact support to restore access.',
  TenantInactive: 'Your organization account is suspended.',
  OAuthCallbackError:
    'Google callback failed. Add your production URL to Google Cloud Console authorized redirect URIs.',
  OAuthSignin: 'Could not start Google sign-in. Check your Google OAuth credentials.',
  Verification: 'The sign-in link is no longer valid.'
}

function resolveAuthErrorMessage(error?: string): string | null {
  if (!error) {
    return null
  }

  const code = error.split('/')[0]

  return AUTH_ERROR_MESSAGES[code] ?? 'Sign-in failed. Please try again.'
}

type LoginProps = {
  mode: Mode
  error?: string
}

const LoginV2 = ({ mode, error: initialError }: LoginProps) => {
  const [error, setError] = useState<string | null>(resolveAuthErrorMessage(initialError))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await signIn('google', { callbackUrl: '/home' })
    } catch {
      setError('Google sign-in failed. Please try again.')
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
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link href='/' className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
            <Typography className='mbs-1'>Sign in with Google to get started</Typography>
          </div>
          <div className='flex flex-col gap-5'>
            {error ? <Alert severity='error'>{error}</Alert> : null}
            <Button
              fullWidth
              variant='contained'
              color='primary'
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              startIcon={<i className='ri-google-fill' />}
            >
              {isSubmitting ? 'Redirecting...' : 'Continue with Google'}
            </Button>
            <Typography variant='body2' color='text.secondary' className='text-center'>
              New users complete organization setup after signing in.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
