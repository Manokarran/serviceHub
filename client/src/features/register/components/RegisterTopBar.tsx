'use client'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { REGISTER_PALETTE, enterSx } from '../constants/register-theme'

type Props = {
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
  signedIn?: boolean
  onGoogleSignIn?: () => void
  googleBusy?: boolean
}

function GoogleMark({ size = 16 }: { size?: number }) {
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

export function RegisterTopBar({
  userName,
  userEmail,
  userImage,
  signedIn,
  onGoogleSignIn,
  googleBusy
}: Props) {
  return (
    <Box
      component='header'
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 2,
        ...enterSx(0)
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          component='img'
          src='/images/brand/sidhiyana-logo-mark.svg'
          alt='Sidhiyana'
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            display: 'block',
            objectFit: 'contain'
          }}
        />
        <Typography
          sx={{
            fontFamily: 'var(--register-display)',
            fontWeight: 700,
            fontSize: '1.05rem',
            letterSpacing: '-0.02em',
            color: REGISTER_PALETTE.text
          }}
        >
          ServiceHub
        </Typography>
      </Box>

      {signedIn && (userName || userEmail) ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            pl: 0.75,
            pr: { xs: 0.75, sm: 1.75 },
            py: 0.75,
            borderRadius: 999,
            border: `1px solid ${REGISTER_PALETTE.hairline}`,
            backgroundColor: REGISTER_PALETTE.surface,
            backdropFilter: 'blur(14px)'
          }}
        >
          <Avatar src={userImage ?? undefined} alt={userName ?? 'You'} sx={{ width: 28, height: 28 }} />
          <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: REGISTER_PALETTE.text, lineHeight: 1.2 }}>
              {userName}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: REGISTER_PALETTE.textFaint, lineHeight: 1.3 }} noWrap>
              Signed in
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          component='button'
          type='button'
          disabled={googleBusy || !onGoogleSignIn}
          onClick={onGoogleSignIn}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            height: 38,
            px: 1.75,
            borderRadius: 999,
            cursor: googleBusy ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--register-body)',
            fontWeight: 600,
            fontSize: '0.82rem',
            color: REGISTER_PALETTE.text,
            border: `1px solid ${REGISTER_PALETTE.hairlineStrong}`,
            backgroundColor: REGISTER_PALETTE.surface,
            backdropFilter: 'blur(14px)',
            transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
            '&:hover': googleBusy
              ? {}
              : {
                  transform: 'translateY(-1px)',
                  backgroundColor: REGISTER_PALETTE.surfaceStrong,
                  borderColor: alpha('#FFFFFF', 0.28)
                }
          }}
        >
          <GoogleMark />
          {googleBusy ? 'Redirecting…' : 'Sign up with Google'}
        </Box>
      )}
    </Box>
  )
}
