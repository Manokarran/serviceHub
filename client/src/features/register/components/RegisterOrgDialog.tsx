'use client'

import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { sanitizeSlugInput, slugify } from '@/lib/utils/slug'

import { REGISTER_PALETTE, borderSpin, rise, shimmer } from '../constants/register-theme'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (values: { companyName: string; slug: string }) => Promise<void>
  onGoogleSignIn: (values: { companyName: string; slug: string }) => Promise<void>
  isSubmitting: boolean
  error: string | null
  suggestedName?: string
  intentLabel?: string
  initialCompanyName?: string
  initialSlug?: string
}

function FieldShell({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        component='label'
        sx={{
          display: 'block',
          mb: 0.85,
          fontSize: '0.76rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: REGISTER_PALETTE.textFaint
        }}
      >
        {label}
      </Typography>
      {children}
      {hint ? (
        <Typography sx={{ mt: 0.75, fontSize: '0.74rem', color: REGISTER_PALETTE.textFaint }}>{hint}</Typography>
      ) : null}
    </Box>
  )
}

const inputSx = {
  width: '100%',
  px: 1.75,
  py: 1.15,
  borderRadius: '13px',
  color: REGISTER_PALETTE.text,
  fontSize: '0.95rem',
  border: `1px solid ${REGISTER_PALETTE.hairline}`,
  backgroundColor: alpha('#FFFFFF', 0.04),
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
  '&.Mui-focused': {
    borderColor: alpha(REGISTER_PALETTE.violetSoft, 0.6),
    backgroundColor: alpha('#FFFFFF', 0.06),
    boxShadow: `0 0 0 4px ${alpha(REGISTER_PALETTE.violet, 0.16)}`
  },
  '& input::placeholder': { color: REGISTER_PALETTE.textFaint, opacity: 1 }
}

function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <Box component='svg' viewBox='0 0 48 48' aria-hidden sx={{ width: size, height: size, flexShrink: 0 }}>
      <path
        fill='#FFC107'
        d='M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z'
      />
      <path
        fill='#FF3D00'
        d='M6.3 14.7l6.6 4.8C14.7 16.1 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z'
      />
      <path
        fill='#4CAF50'
        d='M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z'
      />
      <path
        fill='#1976D2'
        d='M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l.1.1 6.2 5.2C39.3 37.1 44 32 44 24c0-1.3-.1-2.5-.4-3.5z'
      />
    </Box>
  )
}

export function RegisterOrgDialog({
  open,
  onClose,
  onSubmit,
  onGoogleSignIn,
  isSubmitting,
  error,
  suggestedName,
  intentLabel,
  initialCompanyName,
  initialSlug
}: Props) {
  const { data: session, status } = useSession()
  const [companyName, setCompanyName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const isSignedIn = status === 'authenticated' && Boolean(session?.user)
  const sessionLoading = status === 'loading'

  useEffect(() => {
    if (!open) {
      return
    }

    const seed = (initialCompanyName ?? suggestedName)?.trim() || ''
    const seededSlug = initialSlug?.trim() || (seed ? slugify(seed) : '')

    setCompanyName(seed)
    setSlug(seededSlug)
    setSlugTouched(Boolean(initialSlug))
    setAuthError(null)
    setGoogleBusy(false)
  }, [open, suggestedName, initialCompanyName, initialSlug])

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value)

    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  const canSubmit = Boolean(companyName.trim()) && Boolean(slugify(slug)) && !isSubmitting && isSignedIn

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    await onSubmit({ companyName: companyName.trim(), slug: slugify(slug) })
  }

  const handleGoogle = async () => {
    setAuthError(null)
    setGoogleBusy(true)

    try {
      await onGoogleSignIn({ companyName: companyName.trim(), slug: slugify(slug) })
    } catch {
      setAuthError('Google sign-in failed. Please try again.')
      setGoogleBusy(false)
    }
  }

  const busy = isSubmitting || googleBusy || sessionLoading
  const displayError = error || authError

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth='xs'
      slotProps={{
        backdrop: {
          sx: { backgroundColor: alpha('#04050B', 0.78), backdropFilter: 'blur(10px)' }
        },
        paper: {
          sx: {
            position: 'relative',
            overflow: 'visible',
            borderRadius: '24px',
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            boxShadow: 'none',
            animation: `${rise} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both`
          }
        }
      }}
    >
      <Box
        sx={{
          borderRadius: '24px',
          p: '1.5px',
          background: `linear-gradient(120deg, ${alpha(REGISTER_PALETTE.violet, 0.9)}, ${alpha(REGISTER_PALETTE.cyan, 0.6)}, ${alpha(
            REGISTER_PALETTE.pink,
            0.5
          )}, ${alpha(REGISTER_PALETTE.violet, 0.9)})`,
          backgroundSize: '240% 240%',
          animation: `${borderSpin} 7s ease infinite`,
          boxShadow: `0 40px 100px ${alpha('#000000', 0.7)}`
        }}
      >
        <Box
          sx={{
            position: 'relative',
            borderRadius: '23px',
            overflow: 'hidden',
            backgroundColor: '#0A0C16',
            px: { xs: 2.5, sm: 3.25 },
            pt: 3.25,
            pb: 3
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: -120,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 420,
              height: 260,
              background: `radial-gradient(ellipse at center, ${alpha(REGISTER_PALETTE.violet, 0.4)}, transparent 70%)`,
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }}
          />

          <IconButton
            aria-label='Close'
            onClick={onClose}
            disabled={busy}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: REGISTER_PALETTE.textFaint,
              '&:hover': { color: REGISTER_PALETTE.text, backgroundColor: alpha('#FFFFFF', 0.06) }
            }}
          >
            <i className='ri-close-line' />
          </IconButton>

          <Box sx={{ position: 'relative' }}>
            {intentLabel ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.25,
                  py: 0.45,
                  mb: 1.75,
                  borderRadius: 999,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: REGISTER_PALETTE.violetSoft,
                  border: `1px solid ${alpha(REGISTER_PALETTE.violetSoft, 0.28)}`,
                  backgroundColor: alpha(REGISTER_PALETTE.violet, 0.14)
                }}
              >
                <i className='ri-check-line' style={{ fontSize: '0.9rem' }} />
                {intentLabel}
              </Box>
            ) : null}

            <Typography
              sx={{
                fontFamily: 'var(--register-display)',
                fontWeight: 700,
                fontSize: '1.5rem',
                letterSpacing: '-0.03em',
                color: REGISTER_PALETTE.text
              }}
            >
              {isSignedIn ? 'Name your workspace' : 'Create your account'}
            </Typography>
            <Typography sx={{ mt: 0.75, fontSize: '0.88rem', lineHeight: 1.55, color: REGISTER_PALETTE.textMuted }}>
              {isSignedIn
                ? 'One quick step, then we start building.'
                : 'Sign up with Google, name your workspace, and we start building.'}
            </Typography>

            {isSignedIn ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mt: 2.5,
                  mb: 2.5,
                  p: 1.5,
                  borderRadius: '14px',
                  border: `1px solid ${REGISTER_PALETTE.hairline}`,
                  backgroundColor: alpha('#FFFFFF', 0.035)
                }}
              >
                <Avatar
                  src={session?.user?.image ?? undefined}
                  alt={session?.user?.name ?? 'You'}
                  sx={{ width: 38, height: 38 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: '0.88rem', fontWeight: 600, color: REGISTER_PALETTE.text }}>
                    {session?.user?.name}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: '0.78rem', color: REGISTER_PALETTE.textFaint }}>
                    {session?.user?.email}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ mt: 2.5, mb: 2.5 }}>
                <Box
                  component='button'
                  type='button'
                  disabled={busy}
                  onClick={() => void handleGoogle()}
                  sx={{
                    width: '100%',
                    height: 50,
                    borderRadius: '14px',
                    border: `1px solid ${REGISTER_PALETTE.hairlineStrong}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.25,
                    cursor: busy ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--register-body)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: REGISTER_PALETTE.text,
                    backgroundColor: alpha('#FFFFFF', 0.06),
                    transition: 'transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
                    '&:hover': busy
                      ? {}
                      : {
                          transform: 'translateY(-1px)',
                          backgroundColor: alpha('#FFFFFF', 0.1),
                          borderColor: alpha('#FFFFFF', 0.28)
                        }
                  }}
                >
                  <GoogleMark />
                  {googleBusy ? 'Redirecting to Google…' : 'Continue with Google'}
                </Box>
                <Typography
                  sx={{
                    mt: 1.5,
                    textAlign: 'center',
                    fontSize: '0.74rem',
                    color: REGISTER_PALETTE.textFaint
                  }}
                >
                  We only use Google to create your account — no password to remember.
                </Typography>
              </Box>
            )}

            {displayError ? (
              <Box
                role='alert'
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  mb: 2.25,
                  p: 1.5,
                  borderRadius: '13px',
                  border: `1px solid ${alpha('#F87171', 0.35)}`,
                  backgroundColor: alpha('#F87171', 0.12),
                  color: '#FCA5A5',
                  fontSize: '0.83rem'
                }}
              >
                <i className='ri-error-warning-line' style={{ marginTop: 2 }} />
                <span>{displayError}</span>
              </Box>
            ) : null}

            <Box
              component='form'
              noValidate
              onSubmit={event => void handleSubmit(event)}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}
            >
              <FieldShell label='Business name'>
                <InputBase
                  autoFocus={isSignedIn}
                  value={companyName}
                  onChange={event => handleCompanyNameChange(event.target.value)}
                  placeholder='Bloom Hair Studio'
                  inputProps={{ 'aria-label': 'Business name' }}
                  sx={inputSx}
                />
              </FieldShell>

              <FieldShell label='Workspace address' hint='You can change this later in settings.'>
                <InputBase
                  value={slug}
                  onChange={event => {
                    setSlugTouched(true)
                    setSlug(sanitizeSlugInput(event.target.value))
                  }}
                  onBlur={() => setSlug(slugify(slug))}
                  placeholder='bloom-hair-studio'
                  inputProps={{ 'aria-label': 'Workspace address' }}
                  startAdornment={
                    <Typography sx={{ mr: 0.5, fontSize: '0.9rem', color: REGISTER_PALETTE.textFaint, flexShrink: 0 }}>
                      /
                    </Typography>
                  }
                  sx={inputSx}
                />
              </FieldShell>

              {isSignedIn ? (
                <Box
                  component='button'
                  type='submit'
                  disabled={!canSubmit}
                  sx={{
                    mt: 0.5,
                    height: 50,
                    width: '100%',
                    borderRadius: '14px',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--register-body)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: canSubmit ? '#0A0C16' : REGISTER_PALETTE.textFaint,
                    background: canSubmit
                      ? `linear-gradient(100deg, ${REGISTER_PALETTE.violetSoft}, ${REGISTER_PALETTE.cyan} 55%, ${REGISTER_PALETTE.violetSoft})`
                      : alpha('#FFFFFF', 0.07),
                    backgroundSize: '200% 100%',
                    animation: canSubmit ? `${shimmer} 3s linear infinite` : 'none',
                    transition: 'transform 0.2s ease, filter 0.2s ease',
                    '&:hover': canSubmit ? { transform: 'translateY(-1px)', filter: 'brightness(1.06)' } : {}
                  }}
                >
                  {isSubmitting ? 'Creating…' : 'Start building'}
                  {isSubmitting ? null : <i className='ri-arrow-right-line' />}
                </Box>
              ) : (
                <Typography sx={{ textAlign: 'center', fontSize: '0.78rem', color: REGISTER_PALETTE.textFaint }}>
                  After Google, you&apos;ll land right back here to finish.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  )
}
